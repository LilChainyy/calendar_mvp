'use client'

import { Event } from '@/lib/types'
import { useState, useEffect } from 'react'
import CalendarGrid from '@/components/CalendarGrid'
import EventModal from '@/components/EventModal'
import EventPool from '@/components/EventPool'
import EventPoolDrawer from '@/components/EventPoolDrawer'
import StockSearchBar from '@/components/StockSearchBar'
import { ensureUserId } from '@/lib/auth'
import seedEvents from '@/data/seed-events.json'
import { EventFilters } from '@/hooks/useEventSearch'
import { useUserVotes } from '@/hooks/useUserVotes'

export default function CalendarPage() {
  const events = seedEvents as Event[]
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<EventFilters>({
    category: 'all',
    scope: 'all',
    ticker: '',
  })

  const { votes, updateVote } = useUserVotes(userId)

  useEffect(() => {
    try {
      setUserId(ensureUserId())
      setLoading(false)
    } catch (err) {
      setError('Failed to initialize user session')
      setLoading(false)
    }
  }, [])

  const selectedEvent = events.find(e => e.id === selectedEventId) || null

  const handleVote = async (eventId: string, vote: 'yes' | 'no') => {
    console.log('Vote:', eventId, vote, 'userId:', userId)

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, vote })
      })

      if (response.ok) {
        updateVote(eventId, vote)
      }
    } catch (error) {
      console.error('Failed to submit vote:', error)
    }
  }

  return (
    <main className="min-h-screen flex">
      <div className="flex-1 p-4 md:p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Event Calendar</h1>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
            >
              Event Pool
            </button>
          </div>
          <StockSearchBar />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading calendar...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-gray-700 font-semibold mb-2">Error Loading Calendar</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <p className="text-gray-700 font-semibold mb-2">No Events Found</p>
              <p className="text-gray-500 text-sm">There are no events to display at this time.</p>
            </div>
          </div>
        ) : (
          <CalendarGrid
            events={events}
            userId={userId!}
            filters={filters}
            userVotes={votes}
            onEventClick={setSelectedEventId}
          />
        )}
      </div>

      <aside className="hidden lg:block w-80 border-l">
        <EventPool
          events={events}
          filters={filters}
          userVotes={votes}
          onFiltersChange={setFilters}
          onEventClick={setSelectedEventId}
        />
      </aside>

      <EventPoolDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        events={events}
        filters={filters}
        userVotes={votes}
        onFiltersChange={setFilters}
        onEventClick={(id) => {
          setSelectedEventId(id)
          setIsDrawerOpen(false)
        }}
      />

      <EventModal
        isOpen={selectedEventId !== null}
        event={selectedEvent}
        onClose={() => setSelectedEventId(null)}
        onVote={handleVote}
      />
    </main>
  )
}
