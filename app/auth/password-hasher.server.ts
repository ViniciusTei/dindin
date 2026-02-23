import type { PasswordHasher } from "~/domain/users/ports";
import { hashPassword } from "~/auth/password.server";

export const passwordHasher: PasswordHasher = {
  hash(password: string) {
    return hashPassword(password);
  },
};
