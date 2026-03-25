ALTER TABLE "transactions" ADD COLUMN "household_id" text;--> statement-breakpoint
UPDATE "transactions" AS "t"
SET "household_id" = COALESCE(
  (
    SELECT "c"."household_id"
    FROM "categories" AS "c"
    WHERE "c"."id" = "t"."category_id"
    LIMIT 1
  ),
  (
    SELECT "m"."household_id"
    FROM "memberships" AS "m"
    WHERE "m"."user_id" = "t"."user_id"
    ORDER BY "m"."created_at" ASC
    LIMIT 1
  )
);--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "transactions" WHERE "household_id" IS NULL) THEN
    RAISE EXCEPTION 'Nao foi possivel preencher household_id para todas as transacoes existentes.';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "household_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_household_id_idx" ON "transactions" USING btree ("household_id");
