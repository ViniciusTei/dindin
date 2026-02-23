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
