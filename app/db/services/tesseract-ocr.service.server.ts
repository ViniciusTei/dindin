import { createWorker } from "tesseract.js";
import crypto from "node:crypto";
import type { OcrService } from "~/domain/receipt/ports";
import type { ParsedReceipt, ReceiptItem } from "~/domain/receipt/entity";

// ---------------------------------------------------------------------------
// Text parsing helpers
// ---------------------------------------------------------------------------

function parseDateBR(text: string): Date | null {
  const match = /\b(\d{2})\/(\d{2})\/(\d{4})\b/.exec(text);
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseStoreName(lines: string[]): string | null {
  // Store name is typically in the first few non-empty lines before any prices appear
  for (const line of lines.slice(0, 5)) {
    const clean = line.trim();
    if (clean.length >= 3 && !/[\d,]/.test(clean.slice(-3))) {
      return clean;
    }
  }
  return null;
}

// Matches Brazilian price patterns: 1.234,56 | 1234,56 | 12,90
const PRICE_RE = /\b\d{1,3}(?:\.\d{3})*,\d{2}\b/g;

function parsePriceBRL(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

function extractItems(lines: string[]): ReceiptItem[] {
  const items: ReceiptItem[] = [];

  for (const line of lines) {
    const clean = line.trim();
    if (!clean) continue;

    const prices = clean.match(PRICE_RE);
    if (!prices) continue;

    // Use the last price on the line as the item price (usually the total)
    const priceStr = prices[prices.length - 1];
    const price = parsePriceBRL(priceStr);
    if (price <= 0) continue;

    // Try to extract quantity: patterns like "2 UN", "3X", "2 x", qty at start
    let quantity = 1;
    const qtyMatch = /^(\d+)\s*[xX×]\s/.exec(clean) ?? /\b(\d+)\s*(?:UN|un|PC|pc|KG|kg)\b/.exec(clean);
    if (qtyMatch) {
      const q = parseInt(qtyMatch[1], 10);
      if (q > 0 && q < 100) quantity = q;
    }

    // Description: everything before the first price, stripped of qty prefix
    const descRaw = clean.replace(PRICE_RE, "").replace(/\s+/g, " ").trim();
    const desc = descRaw.replace(/^[\d]+\s*[xX×]\s*/, "").trim();
    if (!desc || desc.length < 2) continue;

    const unitPriceCents = Math.round((price / quantity) * 100);

    items.push({
      id: crypto.randomUUID(),
      name: desc,
      quantity,
      unitPriceCents,
      totalPriceCents: Math.round(price * 100),
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// OcrService implementation
// ---------------------------------------------------------------------------

export const tesseractOcrService: OcrService = {
  async parseReceipt({ imageBase64, mimeType }) {
    const imageBuffer = Buffer.from(imageBase64, "base64");

    const worker = await createWorker("por+eng");
    let text: string;
    try {
      const { data } = await worker.recognize(imageBuffer);
      text = data.text;
    } finally {
      await worker.terminate();
    }

    const lines = text.split("\n");

    const storeName = parseStoreName(lines);
    const date = parseDateBR(text);
    const items = extractItems(lines);

    if (items.length === 0) {
      throw new Error("Nenhum item com preço encontrado na nota fiscal.");
    }

    const totalCents = items.reduce((s, i) => s + i.totalPriceCents, 0);

    const receipt: ParsedReceipt = {
      storeName,
      date,
      items,
      totalCents,
    };

    return receipt;
  },
};
