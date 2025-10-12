export interface NewsEvent {
  id: string
  date: string
  ticker: string
  headline: string
  summary: string
  logic: string
  impact: 'bullish' | 'bearish' | 'neutral'
  impactScore: number
  category: EventCategory
  source?: string
  createdAt: string
  updatedAt: string
}

export type EventCategory = 'earnings' | 'policy' | 'partnership' | 'product' | 'regulatory' | 'macro' | 'leadership' | 'lawsuit'
