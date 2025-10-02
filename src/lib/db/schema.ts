import { pgTable, text, timestamp, uuid, index, primaryKey } from 'drizzle-orm/pg-core'

export const stocks = pgTable('stocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticker: text('ticker').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'stock' | 'crypto' | 'etf' | 'index'
  sector: text('sector').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tickerIdx: index('ticker_idx').on(table.ticker),
  typeIdx: index('type_idx').on(table.type),
  sectorIdx: index('sector_idx').on(table.sector),
}))

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  eventDate: timestamp('event_date', { withTimezone: true }).notNull(),
  category: text('category').notNull(), // 'earnings' | 'economic_data' | 'fed_policy' | 'gov_policy' | 'regulatory' | 'corporate_action' | 'macro_event'
  impactScope: text('impact_scope').notNull(), // 'single_stock' | 'sector' | 'market'
  primaryTicker: text('primary_ticker'),
  affectedTickers: text('affected_tickers').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  eventDateIdx: index('event_date_idx').on(table.eventDate),
  categoryIdx: index('category_idx').on(table.category),
  scopeIdx: index('scope_idx').on(table.impactScope),
  primaryTickerIdx: index('primary_ticker_idx').on(table.primaryTicker),
}))

export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  vote: text('vote').notNull(), // 'yes' | 'no' | 'no_comment'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userEventIdx: index('user_event_idx').on(table.userId, table.eventId),
  eventIdx: index('event_idx').on(table.eventId),
  userIdx: index('user_idx').on(table.userId),
}))

export const placements = pgTable('placements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // ISO date string 'yyyy-MM-dd'
  stockTicker: text('stock_ticker'), // Optional: allows per-stock calendar customization (e.g., 'AAPL', 'TSLA', null for global)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index('user_date_idx').on(table.userId, table.date),
  userEventDateIdx: index('user_event_date_idx').on(table.userId, table.eventId, table.date),
  userStockDateIdx: index('user_stock_date_idx').on(table.userId, table.stockTicker, table.date),
  userStockEventIdx: index('user_stock_event_idx').on(table.userId, table.stockTicker, table.eventId),
  stockTickerIdx: index('stock_ticker_idx').on(table.stockTicker),
  eventIdx: index('placement_event_idx').on(table.eventId),
}))

export type Stock = typeof stocks.$inferSelect
export type NewStock = typeof stocks.$inferInsert
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type Vote = typeof votes.$inferSelect
export type NewVote = typeof votes.$inferInsert
export type Placement = typeof placements.$inferSelect
export type NewPlacement = typeof placements.$inferInsert
