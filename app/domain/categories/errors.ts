export class CategoryAlreadyExistsError extends Error {
  constructor() {
    super("Category already exists");
  }
}

export class CategoryNotFoundError extends Error {
  constructor() {
    super("Category not found");
  }
}
