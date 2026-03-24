import { expect, test as base } from "@playwright/test";

import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { cleanupWorker, seedWorker, type SeedData } from "./db";

type WorkerFixtures = {
  seed: SeedData;
};

const runId = process.env.E2E_RUN_ID ?? `${Date.now()}`;

export const test = base.extend<{}, WorkerFixtures>({
  seed: [
    async ({}, use, workerInfo) => {
      if (process.env.E2E_USE_SETUP_CREDENTIALS === "1") {
        // Use shared credentials created by global-setup
        const credsPath = path.resolve(process.cwd(), "e2e", ".setup-credentials.json");
        if (!fs.existsSync(credsPath)) {
          throw new Error(`${credsPath} not found. Ensure global-setup ran or disable E2E_USE_SETUP_CREDENTIALS.`);
        }
        const raw = fs.readFileSync(credsPath, "utf8");
        const data = JSON.parse(raw);

        const pool = new Pool({ connectionString: process.env.DATABASE_URL });

        const seed: SeedData = {
          runId: "shared",
          workerIndex: workerInfo.workerIndex,
          pool,
          householdId: data.householdId,
          categoryName: data.categoryName,
          users: {
            admin: { id: data.admin.id, username: data.admin.username, password: data.admin.password },
            member: { id: data.member.id, username: data.member.username, password: data.member.password },
          },
        };

        await use(seed);
        // Do not delete shared data; just close pool
        await seed.pool.end();
        return;
      }

      const seed = await seedWorker({ runId, workerIndex: workerInfo.workerIndex });
      await use(seed);
      await cleanupWorker(seed);
    },
    { scope: "worker" },
  ],
});

export { expect };
