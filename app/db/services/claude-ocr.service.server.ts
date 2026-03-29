import Anthropic from "@anthropic-ai/sdk";
import crypto from "node:crypto";
import type { OcrService } from "~/domain/receipt/ports";
import type { ParsedReceipt, ReceiptItem } from "~/domain/receipt/entity";
import { env } from "~/lib/env.server";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a receipt OCR assistant. Extract structured data from receipt images.
Return ONLY valid JSON in the exact format specified. No markdown, no explanations.`;

const USER_PROMPT = `Extract the following from this receipt image and return as JSON:
{
  "store_name": string | null,
  "date": string | null (format: DD/MM/YYYY),
  "items": [
    {
      "name": string,
      "quantity": number (default 1 if unclear),
      "unit_price_brl": number (e.g. 22.90)
    }
  ]
}

Rules:
- Prices use Brazilian format (1.234,56 → 1234.56)
- If quantity is unclear, use 1
- If store name is not visible, return null
- If date is not visible, return null
- Return only the JSON, no other text`;

function parseBrazilianPrice(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw !== "string") return 0;
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

function parseDateBR(raw: string | null): Date | null {
  if (!raw) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw.trim());
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export const claudeOcrService: OcrService = {
  async parseReceipt({ imageBase64, mimeType }) {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: USER_PROMPT,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Resposta inválida do OCR.");
    }

    let parsed: {
      store_name?: string | null;
      date?: string | null;
      items?: Array<{ name?: string; quantity?: number; unit_price_brl?: unknown }>;
    };

    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      throw new Error("OCR não retornou JSON válido.");
    }

    const items: ReceiptItem[] = (parsed.items ?? [])
      .filter((item) => item.name && String(item.name).trim())
      .map((item) => {
        const name = String(item.name ?? "").trim();
        const quantity = Math.max(1, Math.round(Number(item.quantity ?? 1) || 1));
        const unitPrice = parseBrazilianPrice(item.unit_price_brl);
        const unitPriceCents = Math.round(unitPrice * 100);
        const totalPriceCents = unitPriceCents * quantity;

        return {
          id: crypto.randomUUID(),
          name,
          quantity,
          unitPriceCents,
          totalPriceCents,
        };
      });

    if (items.length === 0) {
      throw new Error("Nenhum item encontrado na nota fiscal.");
    }

    const totalCents = items.reduce((s, i) => s + i.totalPriceCents, 0);

    const receipt: ParsedReceipt = {
      storeName: parsed.store_name ? String(parsed.store_name).trim() : null,
      date: parseDateBR(parsed.date ?? null),
      items,
      totalCents,
    };

    return receipt;
  },
};
