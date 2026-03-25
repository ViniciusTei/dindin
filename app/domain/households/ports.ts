import type { SetupHouseholdsRepo } from "~/domain/setup/ports";

import type {
  HouseholdAccess,
  HouseholdDetails,
  HouseholdMember,
  HouseholdSummary,
  MembershipRole,
} from "./entity";

export interface HouseholdsRepo extends SetupHouseholdsRepo {
  createHousehold(params: {
    id: string;
    adminUserId: string;
    name: string;
  }): Promise<{ householdId: string }>;

  listForUser(userId: string): Promise<HouseholdAccess[]>;

  findByIdForUser(params: {
    userId: string;
    householdId: string;
  }): Promise<HouseholdAccess | null>;

  updateHouseholdName(params: {
    householdId: string;
    name: string;
  }): Promise<boolean>;

  listMembers(householdId: string): Promise<
    Array<Pick<HouseholdMember, "userId" | "username" | "role" | "createdAt">>
  >;

  findUserByUsername(username: string): Promise<{
    id: string;
    username: string;
  } | null>;

  addMember(params: {
    householdId: string;
    userId: string;
    role: MembershipRole;
  }): Promise<"added" | "already_member">;

  updateMemberRole(params: {
    householdId: string;
    userId: string;
    role: MembershipRole;
  }): Promise<boolean>;

  removeMember(params: {
    householdId: string;
    userId: string;
  }): Promise<boolean>;

  listPaymentShares(householdId: string): Promise<Array<{ userId: string; shareBps: number }>>;

  replacePaymentShares(params: {
    householdId: string;
    shares: Array<{ userId: string; shareBps: number }>;
  }): Promise<void>;

  listSummariesForUser(params: {
    userId: string;
    monthLabel: string;
  }): Promise<HouseholdSummary[]>;

  getDetailsForUser(params: {
    userId: string;
    householdId: string;
    monthLabel: string;
    lookbackMonths: number;
  }): Promise<HouseholdDetails | null>;
}
