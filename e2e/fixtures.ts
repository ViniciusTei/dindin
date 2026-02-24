import { expect, test as base } from "@playwright/test";

import { cleanupWorker, seedWorker, type SeedData } from "./db";

type Fixtures = {
  seed: SeedData;
};

const runId = process.env.E2E_RUN_ID ?? `${Date.now()}`;

export const test = base.extend<Fixtures>({
  seed: [
    async ({}, use, workerInfo) => {
      const seed = await seedWorker({ runId, workerIndex: workerInfo.workerIndex });
      await use(seed);
      await cleanupWorker(seed);
    },
    { scope: "worker" },
  ],
});

export { expect };
