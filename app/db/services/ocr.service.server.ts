import { env } from "~/lib/env.server";
import type { OcrService } from "~/domain/receipt/ports";

/**
 * Returns the best available OCR service:
 * - Claude Vision (claude-haiku-4-5) when ANTHROPIC_API_KEY is set
 * - Tesseract.js (local, free) otherwise
 */
export async function getOcrService(): Promise<OcrService> {
  if (env.ANTHROPIC_API_KEY) {
    const { claudeOcrService } = await import("./claude-ocr.service.server");
    return claudeOcrService;
  }
  const { tesseractOcrService } = await import("./tesseract-ocr.service.server");
  return tesseractOcrService;
}
