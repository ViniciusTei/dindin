export interface SetupUsersStatsRepo {
  hasAnyUsers(): Promise<boolean>;
}

export interface SetupHouseholdsRepo {
  createHouseholdWithAdmin(params: {
    adminUserId: string;
    name?: string;
  }): Promise<{ householdId: string }>;
}
