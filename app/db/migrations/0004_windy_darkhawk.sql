CREATE TABLE "household_payment_shares" (
	"household_id" text NOT NULL,
	"user_id" text NOT NULL,
	"share_bps" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "household_payment_shares_household_id_user_id_pk" PRIMARY KEY("household_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "household_payment_shares" ADD CONSTRAINT "household_payment_shares_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_payment_shares" ADD CONSTRAINT "household_payment_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "household_payment_shares_household_id_idx" ON "household_payment_shares" USING btree ("household_id");