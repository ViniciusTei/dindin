import type { Account } from "./entity";

export interface AccountsRepo {
  listByUser(userId: string): Promise<Account[]>;

  create(params: {
    id: string;
    userId: string;
    name: string;
    initialBalanceCents: number;
  }): Promise<void>;

  rename(params: { userId: string; accountId: string; name: string }): Promise<void>;

  delete(params: { userId: string; accountId: string }): Promise<void>;

  countTransactionsByAccount(params: { userId: string; accountId: string }): Promise<number>;
}
