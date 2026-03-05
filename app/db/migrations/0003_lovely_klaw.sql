CREATE TABLE "credit_card_purchase_prepayments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"purchase_id" text NOT NULL,
	"ym" text NOT NULL,
	"installments_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_card_purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"credit_card_id" text NOT NULL,
	"category_id" text,
	"description" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"installments_total" integer DEFAULT 1 NOT NULL,
	"first_invoice_ym" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text,
	"number_enc" text NOT NULL,
	"expiration_enc" text NOT NULL,
	"cvv_enc" text,
	"brand" text NOT NULL,
	"limit_cents" integer,
	"closing_day" integer NOT NULL,
	"due_day" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_card_purchase_prepayments" ADD CONSTRAINT "credit_card_purchase_prepayments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_card_purchase_prepayments" ADD CONSTRAINT "credit_card_purchase_prepayments_purchase_id_credit_card_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."credit_card_purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_card_purchases" ADD CONSTRAINT "credit_card_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_card_purchases" ADD CONSTRAINT "credit_card_purchases_credit_card_id_credit_cards_id_fk" FOREIGN KEY ("credit_card_id") REFERENCES "public"."credit_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_card_purchases" ADD CONSTRAINT "credit_card_purchases_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_card_purchase_prepayments_user_id_idx" ON "credit_card_purchase_prepayments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_card_purchase_prepayments_purchase_id_idx" ON "credit_card_purchase_prepayments" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "credit_card_purchase_prepayments_ym_idx" ON "credit_card_purchase_prepayments" USING btree ("ym");--> statement-breakpoint
CREATE INDEX "credit_card_purchases_user_id_idx" ON "credit_card_purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_card_purchases_card_id_idx" ON "credit_card_purchases" USING btree ("credit_card_id");--> statement-breakpoint
CREATE INDEX "credit_card_purchases_occurred_at_idx" ON "credit_card_purchases" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "credit_card_purchases_category_id_idx" ON "credit_card_purchases" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "credit_card_purchases_first_invoice_ym_idx" ON "credit_card_purchases" USING btree ("first_invoice_ym");--> statement-breakpoint
CREATE INDEX "credit_cards_user_id_idx" ON "credit_cards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_cards_account_id_idx" ON "credit_cards" USING btree ("account_id");