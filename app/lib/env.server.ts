import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não definido`);
  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  return value;
}

function toBool(input: string | undefined): boolean | undefined {
  if (input === undefined) return undefined;
  const v = input.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(v)) return true;
  if (["0", "false", "no", "n", "off"].includes(v)) return false;
  throw new Error(`Valor inválido para boolean: ${input}`);
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  SESSION_SECRET: requireEnv("SESSION_SECRET"),
  // Base64 de 32 bytes (AES-256-GCM). Opcional para não quebrar ambientes;
  // a feature de cartão deve falhar explicitamente se estiver ausente.
  CARD_ENCRYPTION_KEY: optionalEnv("CARD_ENCRYPTION_KEY"),
  COOKIE_SECURE:
    toBool(optionalEnv("COOKIE_SECURE")) ?? process.env.NODE_ENV === "production",
  ANTHROPIC_API_KEY: requireEnv("ANTHROPIC_API_KEY"),
};
