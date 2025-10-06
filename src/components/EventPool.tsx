'use client'

import { Event } from '@/lib/types'
import { useEventSearch, EventFilters } from '@/hooks/useEventSearch'
import EventBlock from './EventBlock'
import { useState, useMemo } from 'react'

interface Props {
  events: Event[]
  filters: EventFilters
  userVotes: Map<string, 'yes' | 'no' | 'no_comment'>
  onFiltersChange: (filters: EventFilters) => void
  onEventClick: (id: string) => void
}

type SortOption = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc' | 'category'

export default function EventPool({ events, filters, userVotes, onFiltersChange, onEventClick }: Props) {
  const { searchQuery, setSearchQuery, filteredEvents, resultCount } = useEventSearch(events, filters)
  const [sortBy, setSortBy] = useState<SortOption>('date-asc')

  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents]

    switch (sortBy) {
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
      case 'name-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'name-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category))
      default:
        return sorted
    }
  }, [filteredEvents, sortBy])

  return (
    <div className="h-full flex flex-col bg-white border-l">
      <div className="p-4 border-b space-y-3">
        <h2 className="text-lg font-bold">Event Pool</h2>

        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value as any })}
            className="px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="earnings">📊 Earnings</option>
            <option value="economic_data">📈 Economic</option>
            <option value="fed_policy">🏛️ Fed Policy</option>
            <option value="gov_policy">🏛️ Gov Policy</option>
            <option value="regulatory">💊 Regulatory</option>
            <option value="corporate_action">🤝 Corporate</option>
            <option value="macro_event">🌍 Macro</option>
          </select>

          <select
            value={filters.scope}
            onChange={(e) => onFiltersChange({ ...filters, scope: e.target.value as any })}
            className="px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Scopes</option>
            <option value="single_stock">Single Stock</option>
            <option value="sector">Sector</option>
            <option value="market">Market</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Filter by ticker..."
          value={filters.ticker}
          onChange={(e) => onFiltersChange({ ...filters, ticker: e.target.value })}
          className="w-full px-3 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="w-full px-3 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date-asc">Sort: Date (Earliest First)</option>
          <option value="date-desc">Sort: Date (Latest First)</option>
          <option value="name-asc">Sort: Name (A-Z)</option>
          <option value="name-desc">Sort: Name (Z-A)</option>
          <option value="category">Sort: Category</option>
        </select>

        <div className="text-xs text-gray-500">
          {resultCount} {resultCount === 1 ? 'event' : 'events'} found
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sortedEvents.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No events found
          </div>
        ) : (
          sortedEvents.map(event => (
            <EventBlock
              key={event.id}
              id={event.id}
              title={event.title}
              date={event.event_date}
              category={event.category}
              scope={event.impact_scope}
              tickers={event.affected_tickers}
              userVote={userVotes.get(event.id) || null}
              onClick={onEventClick}
              draggable={!event.is_fixed_date}
              isFixedDate={event.is_fixed_date}
            />
          ))
        )}
      </div>
    </div>
  )
}
