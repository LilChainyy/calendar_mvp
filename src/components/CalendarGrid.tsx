'use client'

import { Event } from '@/lib/types'
import { useState, useEffect, useRef, useMemo } from 'react'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, startOfWeek, endOfWeek, isToday } from 'date-fns'
import EventBlock from './EventBlock'
import { EventFilters } from '@/hooks/useEventSearch'

interface Props {
  events: Event[]
  userId: string
  filters: EventFilters
  userVotes: Map<string, 'yes' | 'no' | 'no_comment'>
  onEventClick?: (id: string) => void
}

interface Placement {
  eventId: string
  date: string
}

export default function CalendarGrid({ events, userId, filters, userVotes, onEventClick }: Props) {
  const [currentDate] = useState(new Date())
  const [focusedDay, setFocusedDay] = useState<Date | null>(null)
  const [placements, setPlacements] = useState<Placement[]>([])
  const [dragOverDay, setDragOverDay] = useState<Date | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverTrash, setDragOverTrash] = useState(false)
  const [draggedPlacement, setDraggedPlacement] = useState<{ eventId: string, date: string } | null>(null)
  const [removeMessage, setRemoveMessage] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const storageKey = `event-placements-${userId}`

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesCategory = filters.category === 'all' || event.category === filters.category
      const matchesScope = filters.scope === 'all' || event.impact_scope === filters.scope
      const matchesTicker = !filters.ticker ||
        event.primary_ticker?.toLowerCase().includes(filters.ticker.toLowerCase()) ||
        event.affected_tickers.some(t => t.toLowerCase().includes(filters.ticker.toLowerCase()))

      return matchesCategory && matchesScope && matchesTicker
    })
  }, [events, filters])

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        setPlacements(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse placements:', e)
      }
    }
  }, [storageKey])

  const savePlacement = (eventId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const existing = placements.find(p => p.eventId === eventId && p.date === dateStr)
    if (existing) return

    const newPlacements = [...placements, { eventId, date: dateStr }]
    setPlacements(newPlacements)
    localStorage.setItem(storageKey, JSON.stringify(newPlacements))
    console.log('Saved placement for user:', userId, 'event:', eventId, 'date:', dateStr)
  }

  const removePlacement = (eventId: string, date: string) => {
    const newPlacements = placements.filter(
      p => !(p.eventId === eventId && p.date === date)
    )
    setPlacements(newPlacements)
    localStorage.setItem(storageKey, JSON.stringify(newPlacements))
    console.log('Removed placement for user:', userId, 'event:', eventId, 'date:', date)
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(e => isSameDay(new Date(e.event_date), day))
  }

  const getPlacedEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const placedIds = placements.filter(p => p.date === dateStr).map(p => p.eventId)
    return filteredEvents.filter(e => placedIds.includes(e.id))
  }

  const handleDragOver = (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverDay(day)
  }

  const handleDragLeave = () => {
    setDragOverDay(null)
  }

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    setDragOverDay(null)
    setIsDragging(false)

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      savePlacement(data.id, day)
      console.log('Placed event:', data.id, 'on', format(day, 'yyyy-MM-dd'))
    } catch (err) {
      console.error('Drop failed:', err)
    }
  }

  const handleTrashDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTrash(true)
  }

  const handleTrashDragLeave = () => {
    setDragOverTrash(false)
  }

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverTrash(false)
    setIsDragging(false)

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))

      // Only allow removing user-placed events, not default events
      if (data.isPlaced && draggedPlacement) {
        removePlacement(draggedPlacement.eventId, draggedPlacement.date)
        setRemoveMessage('Event removed from calendar')
        setTimeout(() => setRemoveMessage(null), 2000)
      } else if (!data.isPlaced) {
        setRemoveMessage('Cannot remove default events')
        setTimeout(() => setRemoveMessage(null), 2000)
      }

      setDraggedPlacement(null)
    } catch (err) {
      console.error('Trash drop failed:', err)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDragOverTrash(false)
    setDraggedPlacement(null)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedDay) return
      const currentIndex = days.findIndex(d => isSameDay(d, focusedDay))
      if (currentIndex === -1) return

      let newIndex = currentIndex
      if (e.key === 'ArrowRight') newIndex = Math.min(currentIndex + 1, days.length - 1)
      else if (e.key === 'ArrowLeft') newIndex = Math.max(currentIndex - 1, 0)
      else if (e.key === 'ArrowDown') newIndex = Math.min(currentIndex + 7, days.length - 1)
      else if (e.key === 'ArrowUp') newIndex = Math.max(currentIndex - 7, 0)
      else return

      e.preventDefault()
      setFocusedDay(days[newIndex])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedDay, days])

  const handleEventClick = (id: string) => {
    console.log('Event clicked:', id)
    onEventClick?.(id)
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mb-4 text-xl font-semibold">
        {format(currentDate, 'MMMM yyyy')}
      </div>

      <div ref={gridRef} className="grid grid-cols-7 gap-1 md:gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-sm p-2 text-gray-600">
            {day}
          </div>
        ))}

        {days.map(day => {
          const dayEvents = getEventsForDay(day)
          const placedEvents = getPlacedEventsForDay(day)
          const allDayEvents = [...dayEvents, ...placedEvents]
          const visibleEvents = allDayEvents.slice(0, 3)
          const remaining = allDayEvents.length - 3
          const isCurrentMonth = day.getMonth() === currentDate.getMonth()
          const isFocused = focusedDay && isSameDay(day, focusedDay)
          const isDragOver = dragOverDay && isSameDay(dragOverDay, day)
          const isTodayDate = isToday(day)

          return (
            <div
              key={day.toISOString()}
              tabIndex={0}
              onClick={() => setFocusedDay(day)}
              onFocus={() => setFocusedDay(day)}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
              className={`
                min-h-24 md:min-h-32 p-2 rounded-lg relative
                ${isTodayDate ? 'border-2 border-blue-500 bg-blue-50' : 'border'}
                ${isCurrentMonth ? (isTodayDate ? '' : 'bg-white') : 'bg-gray-50 text-gray-400'}
                ${isFocused ? 'ring-2 ring-blue-500' : (isTodayDate ? '' : 'hover:ring-1 hover:ring-gray-300')}
                ${isDragOver ? 'ring-2 ring-green-500 bg-green-50' : ''}
                cursor-pointer focus:outline-none
              `}
            >
              <div className="text-sm font-medium mb-1 flex items-center justify-between">
                <span>{format(day, 'd')}</span>
                {isTodayDate && (
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {visibleEvents.map(event => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const isPlaced = placements.some(p => p.eventId === event.id && p.date === dateStr)

                  return (
                    <EventBlock
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={event.event_date}
                      category={event.category}
                      scope={event.impact_scope}
                      tickers={event.affected_tickers}
                      userVote={userVotes.get(event.id) || null}
                      onClick={handleEventClick}
                      isPlaced={isPlaced}
                      draggable={!event.is_fixed_date}
                      isFixedDate={event.is_fixed_date}
                      onDragStart={() => {
                        setIsDragging(true)
                        setDraggedPlacement({ eventId: event.id, date: dateStr })
                      }}
                      onDragEnd={handleDragEnd}
                    />
                  )
                })}

                {remaining > 0 && (
                  <div className="text-xs text-gray-500 px-1.5">
                    +{remaining} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Trash Zone - visible when dragging */}
      {isDragging && (
        <div
          onDragOver={handleTrashDragOver}
          onDragLeave={handleTrashDragLeave}
          onDrop={handleTrashDrop}
          className={`
            mt-4 p-6 border-2 border-dashed rounded-lg text-center transition-colors
            ${dragOverTrash ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}
          `}
        >
          <div className="text-4xl mb-2">🗑️</div>
          <div className={`font-medium ${dragOverTrash ? 'text-red-600' : 'text-gray-600'}`}>
            {dragOverTrash ? 'Release to remove' : 'Drag here to remove'}
          </div>
        </div>
      )}

      {/* Remove confirmation message */}
      {removeMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
          {removeMessage}
        </div>
      )}
    </div>
  )
}
