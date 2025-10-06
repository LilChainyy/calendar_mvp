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
