# Spec: Receipt Import — OCR → Transactions

## User flow

```
1. User navigates to /transactions/receipt
2. Uploads an image (file picker or camera)
3. [Loading] Image sent to server → Claude Vision extracts data → image discarded
4. User sees extracted items table (editable: name, qty, unit price)
5. Below the table:
   - Granularity toggle: "Uma transação" | "Por item"
   - Category picker (optional, applies to all)
   - Payment method: Account or Credit Card
   - If credit card: installments field (default 1)
   - Date field (pre-filled from receipt or today)
   - Note field (auto-generated, editable)
6. User submits → transactions created → redirect to /transactions
```

---

## Route: `transactions.receipt.tsx`

Two actions on the same route, distinguished by `_intent`:

- `_intent: "parse"` — receives `multipart/form-data` with the image, calls OCR, returns `ParsedReceipt` JSON. Image is never persisted.
- `_intent: "create"` — receives confirmed items + payment info as form data, creates transactions, redirects.

Client-side state manages the step transition (upload → review). No URL change between steps.

---

## Domain structure

```
app/
├── domain/
│   └── receipt/
│       ├── entity.ts              # ReceiptItem, ParsedReceipt types
│       ├── ports.ts               # OcrService interface
│       ├── usecases/
│       │   ├── parse-receipt.ts   # calls OcrService, returns ParsedReceipt
│       │   └── create-receipt-transactions.ts
│       └── ui/
│           ├── ReceiptUploadStep.tsx
│           ├── ReceiptItemsTable.tsx   # editable rows
│           └── ReceiptPaymentForm.tsx
├── db/
│   └── services/
│       └── claude-ocr.service.server.ts  # implements OcrService via @anthropic-ai/sdk
└── routes/
    └── transactions.receipt.tsx
```

---

## Entity types (`domain/receipt/entity.ts`)

```typescript
type ReceiptItem = {
  id: string            // temp client-side id for form keying
  name: string
  quantity: number      // always >= 1, defaults to 1
  unitPriceCents: number
  totalPriceCents: number  // derived: quantity * unitPriceCents
}

type ParsedReceipt = {
  storeName: string | null
  date: Date | null     // null → caller defaults to today
  items: ReceiptItem[]
  totalCents: number    // sum of all item totals
}
```

---

## Port (`domain/receipt/ports.ts`)

```typescript
interface OcrService {
  parseReceipt(params: {
    imageBase64: string
    mimeType: "image/jpeg" | "image/png" | "image/webp"
  }): Promise<ParsedReceipt>
}
```

---

## OCR service (`db/services/claude-ocr.service.server.ts`)

Uses `claude-haiku-4-5` (fast + cheap for structured extraction). Sends a structured prompt asking for JSON output with:
- `store_name: string | null`
- `date: string | null` (DD/MM/YYYY)
- `items: Array<{ name, quantity, unit_price_brl }>`

Quantities default to `1` when ambiguous. Prices are parsed from the Brazilian format (`1.234,56`).

---

## Usecase: `create-receipt-transactions.ts`

```typescript
type PaymentMethod =
  | { type: "account"; accountId: string }
  | { type: "credit-card"; creditCardId: string; installments: number }

type CreateReceiptTransactionsInput = {
  userId: string
  householdId: string
  storeName: string | null
  date: Date
  categoryId: string | null
  paymentMethod: PaymentMethod
  mode: "single" | "per-item"
  items: ReceiptItem[]
  note: string            // pre-generated, user-edited
}
```

### Single mode → 1 record

- description: `"{storeName} - Compras"` or `"Compras no mercado"`
- amount: sum of all items
- note: full formatted receipt

### Per-item mode → N records

- description: `"{storeName} - {itemName}"` or just `"{itemName}"`
- amount: item total price (`qty × unitPrice`)
- note: `"{storeName} | {date} | {qty}x R$ {unitPrice}"` (concise per-item context)

### Payment method handling

- **Account** → creates `Transaction` records (type: `"expense"`)
- **Credit card** → creates `CreditCardPurchase` records (`installmentsTotal` = user-selected, `firstInvoiceYm` derived from card's `closingDay` and the receipt date)

All records created inside a single `transactionRunner` call.

---

## Auto-generated note format

```
Nota fiscal importada - Pão de Açúcar
Data: 28/03/2026

Itens:
- Arroz Tio João 5kg         x1   R$ 22,90
- Feijão Camil Preto 1kg     x2   R$ 17,00
- Leite Integral Italac 1L   x6   R$ 38,94

Total: R$ 78,84
```

For per-item mode, the shared store/date context is kept in the note of each individual transaction.

---

## Environment

New variable to add to `env.server.ts` and `.env.example`:

```
ANTHROPIC_API_KEY=
```

New dependency:

```
@anthropic-ai/sdk
```

---

## No DB migration needed

The image is discarded after OCR. `ParsedReceipt` is transient — lives only in the action response and client form state. All created records go into existing tables (`transactions` or `credit_card_purchases`).

---

## Edge cases

| Situation | Handling |
|---|---|
| OCR fails / bad image | Return error on parse action, stay on upload step with message |
| No items extracted | Return error, ask user to retry |
| Store name not found | Description falls back to `"Compras no mercado"` |
| Date not found | Default to today |
| Item quantity not found | Default to `1` |
| User removes all items | Disable submit button |
| Credit card `firstInvoiceYm` | Derived from card's `closingDay` vs receipt date (existing logic) |
