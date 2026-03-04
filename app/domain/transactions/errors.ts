export class TransactionNotFoundError extends Error {
  constructor() {
    super("Transaction not found");
  }
}

export class TransactionAccountNotFoundError extends Error {
  constructor() {
    super("Account not found");
  }
}

export class TransactionCategoryNotFoundError extends Error {
  constructor() {
    super("Category not found");
  }
}
