import { pgTable, text, timestamp, uuid, index, primaryKey, numeric } from 'drizzle-orm/pg-core'

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
  isFixedDate: text('is_fixed_date').notNull().default('false'), // 'true' | 'false' - whether the event date is fixed and cannot be moved
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

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  sectors: text('sectors').array().notNull().default([]),
  investmentTimeline: text('investment_timeline').notNull(), // '1' | '2' | '3' | '4' | '5'
  checkFrequency: text('check_frequency').notNull(), // 'multiple_daily' | 'daily' | 'few_weekly' | 'weekly' | 'monthly'
  riskTolerance: text('risk_tolerance').notNull(), // '1' | '2' | '3' | '4' | '5'
  portfolioStrategy: text('portfolio_strategy').notNull(), // 'celebrity' | 'diy' | 'mix'
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
}))

export const userPortfolios = pgTable('user_portfolios', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  brokerName: text('broker_name').notNull(), // 'robinhood' | 'td_ameritrade' | 'etrade' | 'manual'
  accessTokenEncrypted: text('access_token_encrypted'),
  refreshTokenEncrypted: text('refresh_token_encrypted'),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  connectionStatus: text('connection_status').notNull().default('connected'), // 'connected' | 'disconnected' | 'error'
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('portfolio_user_id_idx').on(table.userId),
  brokerNameIdx: index('broker_name_idx').on(table.brokerName),
  connectionStatusIdx: index('connection_status_idx').on(table.connectionStatus),
  userBrokerIdx: index('user_broker_idx').on(table.userId, table.brokerName),
}))

export const portfolioHoldings = pgTable('portfolio_holdings', {
  id: uuid('id').primaryKey().defaultRandom(),
  portfolioId: uuid('portfolio_id').notNull().references(() => userPortfolios.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  quantity: numeric('quantity', { precision: 18, scale: 8 }).notNull(),
  costBasis: numeric('cost_basis', { precision: 18, scale: 2 }),
  currentValue: numeric('current_value', { precision: 18, scale: 2 }),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  portfolioIdIdx: index('portfolio_id_idx').on(table.portfolioId),
  tickerIdx: index('holding_ticker_idx').on(table.ticker),
  portfolioTickerIdx: index('portfolio_ticker_idx').on(table.portfolioId, table.ticker),
}))

export type Stock = typeof stocks.$inferSelect
export type NewStock = typeof stocks.$inferInsert
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type Vote = typeof votes.$inferSelect
export type NewVote = typeof votes.$inferInsert
export type Placement = typeof placements.$inferSelect
export type NewPlacement = typeof placements.$inferInsert
export type UserPreference = typeof userPreferences.$inferSelect
export type NewUserPreference = typeof userPreferences.$inferInsert
export type UserPortfolio = typeof userPortfolios.$inferSelect
export type NewUserPortfolio = typeof userPortfolios.$inferInsert
export type PortfolioHolding = typeof portfolioHoldings.$inferSelect
export type NewPortfolioHolding = typeof portfolioHoldings.$inferInsert
