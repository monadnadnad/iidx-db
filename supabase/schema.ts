import { relations, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUid, authUsers, authenticatedRole } from "drizzle-orm/supabase";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export const playModeEnum = pgEnum("play_mode", ["SP", "DP"]);
export const optionTypeEnum = pgEnum("option_type", ["REGULAR", "MIRROR", "RANDOM", "R-RANDOM", "S-RANDOM"]);
export const chartDiffEnum = pgEnum("chart_diff", ["B", "N", "H", "A", "L"]);
export const playSideEnum = pgEnum("play_side", ["1P", "2P"]);

const ownsRowOf = (column: AnyPgColumn) => sql`${authUid} IS NOT NULL AND ${column} = ${authUid}`;

export const songs = pgTable(
  "songs",
  {
    id: integer().primaryKey(), // 外部から投入されるIDなのでserialではない
    title: text().notNull(),
    textageTag: text(),
    bpmMin: integer().notNull(),
    bpmMax: integer().notNull(),
  },
  table => [
    check("songs_bpm_bounds", sql`${table.bpmMin} <= ${table.bpmMax}`),
    uniqueIndex("uq_songs__textage_tag").on(table.textageTag),
    pgPolicy("songs_read", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
  ],
).enableRLS();

export const charts = pgTable(
  "charts",
  {
    id: bigserial({ mode: "number" }).primaryKey(), // 譜面IDは自動採番
    songId: integer().notNull(),
    playMode: playModeEnum().notNull(),
    diff: chartDiffEnum().notNull(),
    level: integer().notNull(),
    notes: integer().notNull(),
  },
  table => [
    uniqueIndex("uq_charts__song_play_mode_diff").on(table.songId, table.playMode, table.diff),
    foreignKey({
      name: "fk_charts__songs",
      columns: [table.songId],
      foreignColumns: [songs.id],
    }).onDelete("cascade"),
    pgPolicy("charts_select", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
  ],
).enableRLS();

export const chartRecommendations = pgTable(
  "chart_recommendations",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    chartId: bigint({ mode: "number" }).notNull(),
    playSide: playSideEnum().notNull(),
    optionType: optionTypeEnum().notNull(),
    comment: varchar({ length: 255 }),
    laneText1P: varchar("lane_text_1p", { length: 7 }),
    userId: uuid().notNull().default(sql`auth.uid()`),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  table => [
    index("idx_chart_recommendations__chart_created").on(table.chartId, table.createdAt.desc()),
    foreignKey({
      name: "fk_chart_recommendations__charts",
      columns: [table.chartId],
      foreignColumns: [charts.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "fk_chart_recommendations__users",
      columns: [table.userId],
      foreignColumns: [authUsers.id],
    }).onDelete("cascade"),
    pgPolicy("chart_recommendations_select", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
    pgPolicy("chart_recommendations_insert_authenticated", {
      for: "insert",
      to: authenticatedRole,
      withCheck: ownsRowOf(table.userId),
    }),
    pgPolicy("chart_recommendations_update_own", {
      for: "update",
      to: authenticatedRole,
      using: ownsRowOf(table.userId),
      withCheck: ownsRowOf(table.userId),
    }),
    pgPolicy("chart_recommendations_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: ownsRowOf(table.userId),
    }),
  ],
).enableRLS();

export const songsRelations = relations(songs, ({ many }) => ({
  charts: many(charts),
}));

export const chartsRelations = relations(charts, ({ one, many }) => ({
  song: one(songs, { fields: [charts.songId], references: [songs.id] }),
  recommendations: many(chartRecommendations),
}));

export const chartRecommendationsRelations = relations(chartRecommendations, ({ one }) => ({
  chart: one(charts, { fields: [chartRecommendations.chartId], references: [charts.id] }),
}));
