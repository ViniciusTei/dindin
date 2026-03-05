import type { CreditCardsRepo } from "~/domain/credit-cards/ports";

export async function listCreditCards(params: {
  creditCardsRepo: CreditCardsRepo;
  userId: string;
}) {
  return params.creditCardsRepo.listByUser(params.userId);
}
