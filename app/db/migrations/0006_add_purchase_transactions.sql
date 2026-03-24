-- Migration: add mapping table for credit card purchases -> transactions

CREATE TABLE IF NOT EXISTS credit_card_purchase_transactions (
  id text PRIMARY KEY,
  purchase_id text NOT NULL REFERENCES credit_card_purchases(id) ON DELETE CASCADE,
  transaction_id text NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credit_card_purchase_transactions_purchase_id_idx ON credit_card_purchase_transactions(purchase_id);
CREATE INDEX IF NOT EXISTS credit_card_purchase_transactions_transaction_id_idx ON credit_card_purchase_transactions(transaction_id);
