CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"event_date" timestamp with time zone NOT NULL,
	"category" text NOT NULL,
	"impact_scope" text NOT NULL,
	"primary_ticker" text,
	"affected_tickers" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"event_id" uuid NOT NULL,
	"date" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"event_id" uuid NOT NULL,
	"vote" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "placements" ADD CONSTRAINT "placements_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_date_idx" ON "events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "category_idx" ON "events" USING btree ("category");--> statement-breakpoint
CREATE INDEX "scope_idx" ON "events" USING btree ("impact_scope");--> statement-breakpoint
CREATE INDEX "primary_ticker_idx" ON "events" USING btree ("primary_ticker");--> statement-breakpoint
CREATE INDEX "user_date_idx" ON "placements" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "user_event_date_idx" ON "placements" USING btree ("user_id","event_id","date");--> statement-breakpoint
CREATE INDEX "placement_event_idx" ON "placements" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "user_event_idx" ON "votes" USING btree ("user_id","event_id");--> statement-breakpoint
CREATE INDEX "event_idx" ON "votes" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "user_idx" ON "votes" USING btree ("user_id");