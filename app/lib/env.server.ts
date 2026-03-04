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
  COOKIE_SECURE:
    toBool(optionalEnv("COOKIE_SECURE")) ?? process.env.NODE_ENV === "production",
};
