CREATE TYPE "public"."chart_diff" AS ENUM('B', 'N', 'H', 'A', 'L');--> statement-breakpoint
CREATE TYPE "public"."option_type" AS ENUM('REGULAR', 'MIRROR', 'RANDOM', 'R-RANDOM', 'S-RANDOM');--> statement-breakpoint
CREATE TYPE "public"."play_mode" AS ENUM('SP', 'DP');--> statement-breakpoint
CREATE TYPE "public"."play_side" AS ENUM('1P', '2P');--> statement-breakpoint
CREATE TABLE "chart_recommendations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"chart_id" bigint NOT NULL,
	"play_side" "play_side" NOT NULL,
	"option_type" "option_type" NOT NULL,
	"comment" varchar(255),
	"lane_text_1p" varchar(7),
	"user_id" uuid DEFAULT auth.uid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chart_recommendations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "charts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"song_id" integer NOT NULL,
	"play_mode" "play_mode" NOT NULL,
	"diff" chart_diff NOT NULL,
	"level" integer NOT NULL,
	"notes" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "charts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "songs" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"textage_tag" text,
	"bpm_min" integer NOT NULL,
	"bpm_max" integer NOT NULL,
	CONSTRAINT "songs_bpm_bounds" CHECK ("songs"."bpm_min" <= "songs"."bpm_max")
);
--> statement-breakpoint
ALTER TABLE "songs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chart_recommendations" ADD CONSTRAINT "fk_chart_recommendations__charts" FOREIGN KEY ("chart_id") REFERENCES "public"."charts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_recommendations" ADD CONSTRAINT "fk_chart_recommendations__users" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charts" ADD CONSTRAINT "fk_charts__songs" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chart_recommendations__chart_created" ON "chart_recommendations" USING btree ("chart_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_charts__song_play_mode_diff" ON "charts" USING btree ("song_id","play_mode","diff");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_songs__textage_tag" ON "songs" USING btree ("textage_tag");--> statement-breakpoint
CREATE POLICY "chart_recommendations_select" ON "chart_recommendations" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "chart_recommendations_insert_authenticated" ON "chart_recommendations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) IS NOT NULL AND "chart_recommendations"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "chart_recommendations_update_own" ON "chart_recommendations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) IS NOT NULL AND "chart_recommendations"."user_id" = (select auth.uid())) WITH CHECK ((select auth.uid()) IS NOT NULL AND "chart_recommendations"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "chart_recommendations_delete_own" ON "chart_recommendations" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) IS NOT NULL AND "chart_recommendations"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "charts_select" ON "charts" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "songs_read" ON "songs" AS PERMISSIVE FOR SELECT TO public USING (true);