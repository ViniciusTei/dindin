import type { ParsedReceipt } from "~/domain/receipt/entity";

export interface OcrService {
  parseReceipt(params: {
    imageBase64: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
  }): Promise<ParsedReceipt>;
}
