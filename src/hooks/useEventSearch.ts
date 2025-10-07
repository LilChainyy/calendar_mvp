import { useState, useMemo } from 'react'
import { Event, Category, Scope } from '@/lib/types'

export interface EventFilters {
  category: Category | 'all'
  scope: Scope | 'all'
  ticker: string
}

export function useEventSearch(events: Event[], filters: EventFilters) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const query = searchQuery.toLowerCase()
      const matchesSearch = !query ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.primary_ticker?.toLowerCase().includes(query) ||
        event.affected_tickers.some(t => t.toLowerCase().includes(query))

      const matchesCategory = filters.category === 'all' || event.category === filters.category
      const matchesScope = filters.scope === 'all' || event.impact_scope === filters.scope
      const matchesTicker = !filters.ticker ||
        event.impact_scope === 'market' ||
        event.primary_ticker?.toLowerCase().includes(filters.ticker.toLowerCase()) ||
        event.affected_tickers.some(t => t.toLowerCase().includes(filters.ticker.toLowerCase()))

      return matchesSearch && matchesCategory && matchesScope && matchesTicker
    })
  }, [events, searchQuery, filters])

  return {
    searchQuery,
    setSearchQuery,
    filteredEvents,
    resultCount: filteredEvents.length,
  }
}
