import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_KEY: z.string(),
  VITE_AUTH_DOMAIN: z.string(),
  VITE_PROJECT_ID: z.string(),
  VITE_STORAGE_BUCKET: z.string(),
  VITE_MESSAGING_SENDER_ID: z.string(),
  VITE_APP_ID: z.string(),
  VITE_MEASUREMENT_ID: z.string(),
});

const env = EnvSchema.parse(import.meta.env);
export default env;
