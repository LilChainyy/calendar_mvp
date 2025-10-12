import { NewsEvent } from '@/types/news'
import newsEventsData from '@/data/news-events.json'

/**
 * Get all news events
 */
export function getAllNewsEvents(): NewsEvent[] {
  return newsEventsData as NewsEvent[]
}

/**
 * Get news events for a specific date
 * @param date - ISO format date string (YYYY-MM-DD)
 */
export function getNewsEventsByDate(date: string): NewsEvent[] {
  return newsEventsData.filter(event => event.date === date) as NewsEvent[]
}

/**
 * Get news events for a specific ticker
 * @param ticker - Stock ticker symbol (e.g., 'NVDA')
 */
export function getNewsEventsByTicker(ticker: string): NewsEvent[] {
  return newsEventsData.filter(event => event.ticker.toLowerCase() === ticker.toLowerCase()) as NewsEvent[]
}

/**
 * Get news events within a date range
 * @param startDate - ISO format date string (YYYY-MM-DD)
 * @param endDate - ISO format date string (YYYY-MM-DD)
 */
export function getNewsEventsByDateRange(startDate: string, endDate: string): NewsEvent[] {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return newsEventsData.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= start && eventDate <= end
  }) as NewsEvent[]
}

/**
 * Get news events by impact type
 * @param impact - 'bullish', 'bearish', or 'neutral'
 */
export function getNewsEventsByImpact(impact: 'bullish' | 'bearish' | 'neutral'): NewsEvent[] {
  return newsEventsData.filter(event => event.impact === impact) as NewsEvent[]
}

/**
 * Get news events by category
 * @param category - Event category
 */
export function getNewsEventsByCategory(category: NewsEvent['category']): NewsEvent[] {
  return newsEventsData.filter(event => event.category === category) as NewsEvent[]
}

/**
 * Get a single news event by ID
 * @param id - Event ID
 */
export function getNewsEventById(id: string): NewsEvent | undefined {
  return newsEventsData.find(event => event.id === id) as NewsEvent | undefined
}

/**
 * Get news events sorted by impact score (absolute value)
 * @param limit - Optional limit on number of results
 */
export function getNewsEventsByImpactScore(limit?: number): NewsEvent[] {
  const sorted = [...newsEventsData].sort((a, b) =>
    Math.abs(b.impactScore) - Math.abs(a.impactScore)
  ) as NewsEvent[]

  return limit ? sorted.slice(0, limit) : sorted
}

/**
 * Get upcoming news events (today and future)
 */
export function getUpcomingNewsEvents(): NewsEvent[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return newsEventsData.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= today
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as NewsEvent[]
}

/**
 * Get past news events
 */
export function getPastNewsEvents(): NewsEvent[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return newsEventsData.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate < today
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as NewsEvent[]
}

/**
 * Get top N news events for a specific date and ticker, sorted by impact score
 * @param date - ISO format date string (YYYY-MM-DD)
 * @param ticker - Stock ticker symbol (e.g., 'NVDA')
 * @param limit - Number of top events to return (default: 3)
 * @returns Top N news events sorted by absolute impact score
 */
export function getTopNewsForDateAndTicker(date: string, ticker: string, limit: number = 3): NewsEvent[] {
  return newsEventsData
    .filter(event =>
      event.date === date &&
      event.ticker.toLowerCase() === ticker.toLowerCase()
    )
    .sort((a, b) => Math.abs(b.impactScore) - Math.abs(a.impactScore))
    .slice(0, limit) as NewsEvent[]
}
