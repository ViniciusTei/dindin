export class MonthAlreadyExistsError extends Error {
  override name = "MonthAlreadyExistsError";

  constructor() {
    super("Month already exists");
  }
}
