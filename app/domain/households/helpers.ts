import type { MembershipRole } from "./entity";

export function formatRole(role: MembershipRole): string {
  return role === "admin" ? "Administrador" : "Membro";
}
