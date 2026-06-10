ALTER TABLE "credit_cards" ALTER COLUMN "number_enc" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_cards" ALTER COLUMN "expiration_enc" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_cards" ALTER COLUMN "brand" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_cards" ALTER COLUMN "closing_day" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_cards" ALTER COLUMN "due_day" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_cards" ADD COLUMN "nickname" text;--> statement-breakpoint
UPDATE "credit_cards" SET "nickname" = 'Cartão' WHERE "nickname" IS NULL;--> statement-breakpoint
ALTER TABLE "credit_cards" ALTER COLUMN "nickname" SET NOT NULL;