export class AccountAlreadyExistsError extends Error {
  constructor() {
    super("Account already exists");
  }
}

export class AccountNotFoundError extends Error {
  constructor() {
    super("Account not found");
  }
}
