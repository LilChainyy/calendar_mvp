ALTER TABLE "placements" ADD COLUMN "stock_ticker" text;--> statement-breakpoint
CREATE INDEX "user_stock_date_idx" ON "placements" USING btree ("user_id","stock_ticker","date");--> statement-breakpoint
CREATE INDEX "user_stock_event_idx" ON "placements" USING btree ("user_id","stock_ticker","event_id");--> statement-breakpoint
CREATE INDEX "stock_ticker_idx" ON "placements" USING btree ("stock_ticker");