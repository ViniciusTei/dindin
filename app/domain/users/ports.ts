import type { UserSummary } from "./entity";

export interface UsersRepo {
  listSummaries(): Promise<UserSummary[]>;
  existsByUsername(username: string): Promise<boolean>;
  create(params: {
    id: string;
    username: string;
    passwordHash: string;
    isAdmin: boolean;
  }): Promise<void>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

export interface UsersEraseRepo {
  eraseUserData(params: { userId: string }): Promise<{ deleted: boolean }>;
}

export interface UserPasswordRepo {
  updatePasswordHash(userId: string, newHash: string): Promise<void>;
}

export interface PasswordVerifier {
  verify(params: { hash: string; password: string }): Promise<boolean>;
}
