export type Category =
  | 'earnings'
  | 'economic_data'
  | 'fed_policy'
  | 'gov_policy'
  | 'regulatory'
  | 'corporate_action'
  | 'macro_event'

export type Scope = 'single_stock' | 'sector' | 'market'

export interface Event {
  id: string
  title: string
  description: string
  event_date: string
  event_time?: string
  category: Category
  impact_scope: Scope
  primary_ticker?: string
  affected_tickers: string[]
  certainty_level: 'confirmed' | 'speculative'
  source_url?: string
  is_default: boolean
  is_fixed_date: boolean
}

export interface VoteAggregate {
  total_votes: number
  yes_votes: number
  no_votes: number
  no_comment_votes: number
}

export interface UserPlacement {
  event_id: string
  user_id: string
  date_placed: string
  is_visible: boolean
}

// Portfolio Integration Types
export type BrokerName = 'robinhood' | 'td_ameritrade' | 'etrade' | 'manual'
export type ConnectionStatus = 'connected' | 'disconnected' | 'error'

export interface Portfolio {
  id: string
  user_id: string
  broker_name: BrokerName
  connection_status: ConnectionStatus
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export interface Holding {
  id: string
  portfolio_id: string
  ticker: string
  quantity: string | number
  cost_basis: string | number | null
  current_value: string | number | null
  last_updated: string
  created_at: string
}

export interface BrokerConnection {
  broker: BrokerName
  status: ConnectionStatus
  last_sync?: string
  holdings_count?: number
}

export interface PortfolioSyncResponse {
  success: boolean
  holdings?: Holding[]
  last_sync_at?: string
  error?: string
}

export interface ManualPortfolioRequest {
  tickers: string[]
}
