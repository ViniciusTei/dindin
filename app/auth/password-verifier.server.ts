import { verifyPassword } from "~/auth/password.server";
import type { PasswordVerifier } from "~/domain/auth/ports";

export const passwordVerifier: PasswordVerifier = {
  verify(params) {
    return verifyPassword(params.hash, params.password);
  },
};
