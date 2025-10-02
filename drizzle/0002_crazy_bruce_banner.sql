CREATE TABLE "stocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticker" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"sector" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stocks_ticker_unique" UNIQUE("ticker")
);
--> statement-breakpoint
CREATE INDEX "ticker_idx" ON "stocks" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX "type_idx" ON "stocks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "sector_idx" ON "stocks" USING btree ("sector");