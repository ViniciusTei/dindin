import crypto from "node:crypto";

import { env } from "~/lib/env.server";

function getKey(): Buffer {
  const raw = env.CARD_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "CARD_ENCRYPTION_KEY não definido (necessário para criptografia de cartão de crédito)"
    );
  }

  let key: Buffer;
  try {
    key = Buffer.from(raw, "base64");
  } catch {
    throw new Error("CARD_ENCRYPTION_KEY inválido (base64 esperado)");
  }

  if (key.length !== 32) {
    throw new Error(
      `CARD_ENCRYPTION_KEY inválido: esperado 32 bytes, recebido ${key.length}`
    );
  }

  return key;
}

// Formato: v1:<iv_b64>:<tag_b64>:<cipher_b64>
export function encryptString(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const key = getKey();

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function decryptString(payload: string): string {
  const [version, ivB64, tagB64, cipherB64] = payload.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !cipherB64) {
    throw new Error("Payload decriptografável inválido");
  }

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(cipherB64, "base64");

  const key = getKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}
