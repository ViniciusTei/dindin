import type { Route } from "./+types/transactions.receipt";
import crypto from "node:crypto";
import { redirect, useNavigation } from "react-router";
import { useState, useEffect } from "react";

import { requireUserId } from "~/auth/session.server";
import {
  getPreferredHouseholdForUser,
  requireHouseholdAccess,
} from "~/auth/household.server";
import { drizzleTransactionRunner } from "~/db/db.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { categoriesRepo } from "~/db/repositories/categories.repo.server";
import { creditCardsRepo } from "~/db/repositories/credit-cards.repo.server";
import { creditCardPurchasesRepo } from "~/db/repositories/credit-card-purchases.repo.server";
import { transactionsRepo } from "~/db/repositories/transactions.repo.server";
import { getOcrService } from "~/db/services/ocr.service.server";
import { listAccounts } from "~/domain/accounts/usecases/list-accounts";
import { listCategories } from "~/domain/categories/usecases/list-categories";
import { listCreditCards } from "~/domain/credit-cards/usecases/list-credit-cards";
import { parseReceipt } from "~/domain/receipt/usecases/parse-receipt";
import { createReceiptTransactions } from "~/domain/receipt/usecases/create-receipt-transactions";
import { decryptString } from "~/lib/crypto.server";
import type { ReceiptItem } from "~/domain/receipt/entity";
import { ReceiptUploadStep } from "~/domain/receipt/ui/ReceiptUploadStep";
import { ReceiptItemsTable } from "~/domain/receipt/ui/ReceiptItemsTable";
import { ReceiptPaymentForm } from "~/domain/receipt/ui/ReceiptPaymentForm";
import { formatBRL } from "~/lib/money";

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateNote(receipt: {
  storeName: string | null;
  date: Date | null;
  items: ReceiptItem[];
}): string {
  const header = receipt.storeName
    ? `Nota fiscal importada - ${receipt.storeName}`
    : "Nota fiscal importada";

  const dateStr = receipt.date
    ? receipt.date.toLocaleDateString("pt-BR", { timeZone: "UTC" })
    : todayISODate().split("-").reverse().join("/");

  const itemLines = receipt.items
    .map((item) => {
      const name = item.name.padEnd(28, " ").slice(0, 28);
      const qty = `x${item.quantity}`;
      const price = formatBRL(item.unitPriceCents);
      return `- ${name} ${qty.padStart(3, " ")}   ${price}`;
    })
    .join("\n");

  const total = receipt.items.reduce((s, i) => s + i.totalPriceCents, 0);

  return `${header}\nData: ${dateStr}\n\nItens:\n${itemLines}\n\nTotal: ${formatBRL(total)}`;
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const url = new URL(request.url);
  const householdIdParam = url.searchParams.get("householdId");

  let householdId: string;
  if (householdIdParam) {
    await requireHouseholdAccess({ userId, householdId: householdIdParam });
    householdId = householdIdParam;
  } else {
    const household = await getPreferredHouseholdForUser({ request, userId });
    if (!household) return redirect("/households");
    householdId = household.householdId;
  }

  const [accounts, categories, cards] = await Promise.all([
    listAccounts({ accountsRepo, userId }),
    listCategories({ categoriesRepo, householdId }),
    listCreditCards({ creditCardsRepo, userId }),
  ]);

  const viewCards = cards.map((c) => {
    let last4 = "????";
    try {
      if (c.numberEnc) {
        const number = decryptString(c.numberEnc);
        last4 = number.slice(-4);
      }
    } catch {
      // ignore decrypt errors — use placeholder
    }
    return {
      id: c.id,
      brand: String(c.brand),
      last4,
      closingDay: c.closingDay,
      accountId: c.accountId,
    };
  });

  return {
    accounts,
    categories,
    cards: viewCards,
    householdId,
    today: todayISODate(),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);

  const contentType = request.headers.get("content-type") ?? "";
  if (
    !contentType.includes("multipart/form-data") &&
    !contentType.includes("application/x-www-form-urlencoded")
  ) {
    return { type: "error" as const, message: "Formato inválido." };
  }

  const form = await request.formData();
  const intent = String(form.get("_intent") ?? "");

  if (intent === "parse") {
    const imageFile = form.get("image");
    if (!(imageFile instanceof File) || imageFile.size === 0) {
      return { type: "error" as const, message: "Selecione uma imagem." };
    }

    const mimeType = imageFile.type;
    if (
      mimeType !== "image/jpeg" &&
      mimeType !== "image/png" &&
      mimeType !== "image/webp"
    ) {
      return {
        type: "error" as const,
        message: "Formato de imagem inválido. Use JPEG, PNG ou WebP.",
      };
    }

    const buffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(buffer).toString("base64");

    try {
      const ocrService = await getOcrService();
      const receipt = await parseReceipt({
        ocrService,
        imageBase64,
        mimeType,
      });

      if (receipt.items.length === 0) {
        return {
          type: "error" as const,
          message: "Nenhum item encontrado na nota fiscal. Tente outra imagem.",
        };
      }

      return {
        type: "parsed" as const,
        receipt: {
          storeName: receipt.storeName,
          date: receipt.date?.toISOString() ?? null,
          items: receipt.items,
          totalCents: receipt.totalCents,
        },
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao processar imagem.";
      return { type: "error" as const, message };
    }
  }

  if (intent === "create") {
    const householdId = String(form.get("householdId") ?? "");
    await requireHouseholdAccess({ userId, householdId });

    const itemsJson = String(form.get("items") ?? "[]");
    let items: ReceiptItem[];
    try {
      items = JSON.parse(itemsJson);
    } catch {
      return { type: "error" as const, message: "Dados de itens inválidos." };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return {
        type: "error" as const,
        message: "Nenhum item para criar transações.",
      };
    }

    const storeName = String(form.get("storeName") ?? "").trim() || null;
    const dateRaw = String(form.get("date") ?? "").trim();
    const date = dateRaw ? new Date(`${dateRaw}T00:00:00.000Z`) : new Date();
    if (Number.isNaN(date.getTime())) {
      return { type: "error" as const, message: "Data inválida." };
    }

    const categoryId = String(form.get("categoryId") ?? "").trim() || null;
    const mode = String(form.get("mode") ?? "single") as "single" | "per-item";
    const paymentType = String(form.get("paymentType") ?? "account");

    let paymentMethod: Parameters<
      typeof createReceiptTransactions
    >[0]["paymentMethod"];

    if (paymentType === "credit-card") {
      const creditCardId = String(form.get("creditCardId") ?? "").trim();
      if (!creditCardId)
        return { type: "error" as const, message: "Selecione um cartão." };

      const card = await creditCardsRepo.findById({ userId, creditCardId });
      if (!card)
        return { type: "error" as const, message: "Cartão não encontrado." };

      const installments = Math.max(
        1,
        Number(form.get("installments") ?? 1) || 1,
      );
      if (card.closingDay == null) {
        return { type: "error" as const, message: "Cartão precisa ter dia de fechamento definido." };
      }

      paymentMethod = {
        type: "credit-card",
        creditCardId,
        accountId: card.accountId,
        closingDay: card.closingDay,
        installments,
      };
    } else {
      const accountId = String(form.get("accountId") ?? "").trim();
      if (!accountId)
        return { type: "error" as const, message: "Selecione uma conta." };
      paymentMethod = { type: "account", accountId };
    }

    const result = await createReceiptTransactions({
      transactionRunner: drizzleTransactionRunner,
      transactionsRepo,
      purchasesRepo: creditCardPurchasesRepo,
      idFactory: () => crypto.randomUUID(),
      userId,
      householdId,
      storeName,
      date,
      categoryId,
      paymentMethod,
      mode,
      items,
    });

    if (!result.ok) {
      return { type: "error" as const, message: result.error };
    }

    return redirect("/transactions");
  }

  return { type: "error" as const, message: "Ação inválida." };
}

export default function TransactionsReceipt({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [step, setStep] = useState<"upload" | "review">("upload");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [receiptDate, setReceiptDate] = useState<string>(loaderData.today);

  useEffect(() => {
    if (actionData?.type === "parsed") {
      const r = actionData.receipt;
      setStoreName(r.storeName);
      setItems(r.items);
      if (r.date) {
        setReceiptDate(r.date.slice(0, 10));
      }
      setStep("review");
    }
  }, [actionData]);

  function updateItem(
    id: string,
    field: "name" | "quantity" | "unitPriceCents",
    value: string | number,
  ) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item };
        if (field === "name") {
          updated.name = String(value);
        } else if (field === "quantity") {
          const qty = Math.max(1, Math.round(Number(value) || 1));
          updated.quantity = qty;
          updated.totalPriceCents = qty * item.unitPriceCents;
        } else if (field === "unitPriceCents") {
          const cents = Math.round(Number(value) * 100);
          updated.unitPriceCents = cents;
          updated.totalPriceCents = item.quantity * cents;
        }
        return updated;
      }),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        quantity: 1,
        unitPriceCents: 0,
        totalPriceCents: 0,
      },
    ]);
  }

  const note = generateNote({
    storeName,
    date: receiptDate ? new Date(`${receiptDate}T00:00:00.000Z`) : null,
    items,
  });
  const parseError =
    actionData?.type === "error" ? actionData.message : undefined;

  if (step === "upload") {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <ReceiptUploadStep error={parseError} loading={isSubmitting} />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setStep("upload")}
        >
          ← Voltar
        </button>
        <h2 className="text-xl font-semibold">Revisar itens</h2>
      </div>

      {storeName && (
        <p className="text-base-content/60 mb-4 text-sm">
          Estabelecimento:{" "}
          <span className="font-medium text-base-content">{storeName}</span>
        </p>
      )}

      <ReceiptItemsTable
        items={items}
        onUpdate={updateItem}
        onRemove={removeItem}
        onAdd={addItem}
      />

      <div className="divider" />

      <form method="post">
        <input type="hidden" name="_intent" value="create" />
        <input
          type="hidden"
          name="householdId"
          value={loaderData.householdId}
        />
        <input type="hidden" name="storeName" value={storeName ?? ""} />
        <input type="hidden" name="items" value={JSON.stringify(items)} />

        <ReceiptPaymentForm
          accounts={loaderData.accounts}
          categories={loaderData.categories}
          cards={loaderData.cards}
          defaultDate={receiptDate}
          defaultNote={note}
          totalCents={items.reduce((s, i) => s + i.totalPriceCents, 0)}
        />

        {actionData?.type === "error" && step === "review" && (
          <div role="alert" className="alert alert-error alert-soft mt-4">
            <span>{actionData.message}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setStep("upload")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={items.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Salvando…
              </>
            ) : (
              "Criar transações"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
