CREATE TABLE "user_portfolios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"broker_name" text NOT NULL,
	"access_token_encrypted" text,
	"refresh_token_encrypted" text,
	"token_expires_at" timestamp with time zone,
	"connection_status" text DEFAULT 'connected' NOT NULL,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_holdings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"ticker" text NOT NULL,
	"quantity" numeric(18, 8) NOT NULL,
	"cost_basis" numeric(18, 2),
	"current_value" numeric(18, 2),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_portfolio_id_user_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."user_portfolios"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "portfolio_user_id_idx" ON "user_portfolios" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "broker_name_idx" ON "user_portfolios" USING btree ("broker_name");
--> statement-breakpoint
CREATE INDEX "connection_status_idx" ON "user_portfolios" USING btree ("connection_status");
--> statement-breakpoint
CREATE INDEX "user_broker_idx" ON "user_portfolios" USING btree ("user_id","broker_name");
--> statement-breakpoint
CREATE INDEX "portfolio_id_idx" ON "portfolio_holdings" USING btree ("portfolio_id");
--> statement-breakpoint
CREATE INDEX "holding_ticker_idx" ON "portfolio_holdings" USING btree ("ticker");
--> statement-breakpoint
CREATE INDEX "portfolio_ticker_idx" ON "portfolio_holdings" USING btree ("portfolio_id","ticker");
