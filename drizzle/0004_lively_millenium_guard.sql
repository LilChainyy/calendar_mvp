CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"sectors" text[] DEFAULT '{}' NOT NULL,
	"investment_timeline" text NOT NULL,
	"check_frequency" text NOT NULL,
	"risk_tolerance" text NOT NULL,
	"portfolio_strategy" text NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "user_preferences" USING btree ("user_id");