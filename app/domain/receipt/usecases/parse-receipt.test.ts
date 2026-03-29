import { describe, expect, it, vi } from "vitest";
import { parseReceipt } from "./parse-receipt";
import type { OcrService } from "~/domain/receipt/ports";
import type { ParsedReceipt } from "~/domain/receipt/entity";

function makeOcrService(returns: ParsedReceipt): OcrService {
  return {
    parseReceipt: vi.fn().mockResolvedValue(returns),
  };
}

const sampleReceipt: ParsedReceipt = {
  storeName: "Pão de Açúcar",
  date: new Date("2026-03-28T00:00:00.000Z"),
  items: [
    { id: "i1", name: "Arroz", quantity: 1, unitPriceCents: 2290, totalPriceCents: 2290 },
  ],
  totalCents: 2290,
};

describe("parseReceipt", () => {
  it("delega ao OcrService com os parâmetros corretos", async () => {
    const ocrService = makeOcrService(sampleReceipt);

    await parseReceipt({
      ocrService,
      imageBase64: "base64data",
      mimeType: "image/jpeg",
    });

    expect(ocrService.parseReceipt).toHaveBeenCalledWith({
      imageBase64: "base64data",
      mimeType: "image/jpeg",
    });
  });

  it("retorna o ParsedReceipt do OcrService sem modificação", async () => {
    const ocrService = makeOcrService(sampleReceipt);

    const result = await parseReceipt({
      ocrService,
      imageBase64: "base64data",
      mimeType: "image/png",
    });

    expect(result).toEqual(sampleReceipt);
  });

  it("propaga erro do OcrService", async () => {
    const ocrService: OcrService = {
      parseReceipt: vi.fn().mockRejectedValue(new Error("OCR falhou")),
    };

    await expect(
      parseReceipt({ ocrService, imageBase64: "x", mimeType: "image/jpeg" }),
    ).rejects.toThrow("OCR falhou");
  });
});
