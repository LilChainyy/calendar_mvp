'use client'

import { Event } from '@/lib/types'
import EventPool from './EventPool'
import { EventFilters } from '@/hooks/useEventSearch'

interface Props {
  isOpen: boolean
  onClose: () => void
  events: Event[]
  filters: EventFilters
  userVotes: Map<string, 'yes' | 'no' | 'no_comment'>
  onFiltersChange: (filters: EventFilters) => void
  onEventClick: (id: string) => void
}

export default function EventPoolDrawer({ isOpen, onClose, events, filters, userVotes, onFiltersChange, onEventClick }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Event Pool</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <EventPool
              events={events}
              filters={filters}
              userVotes={userVotes}
              onFiltersChange={onFiltersChange}
              onEventClick={onEventClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
