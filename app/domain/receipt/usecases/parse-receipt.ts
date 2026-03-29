import type { OcrService } from "~/domain/receipt/ports";
import type { ParsedReceipt } from "~/domain/receipt/entity";

export async function parseReceipt(params: {
  ocrService: OcrService;
  imageBase64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}): Promise<ParsedReceipt> {
  return params.ocrService.parseReceipt({
    imageBase64: params.imageBase64,
    mimeType: params.mimeType,
  });
}
