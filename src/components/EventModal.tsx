'use client'

import { Event } from '@/lib/types'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import CategoryTag from './CategoryTag'

interface Props {
  isOpen: boolean
  event: Event | null
  onClose: () => void
  onVote?: (eventId: string, vote: 'yes' | 'no') => void
}

export default function EventModal({ isOpen, event, onClose, onVote }: Props) {
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null)
  const [mockAggregate] = useState({ yes: 700, no: 300, total: 1000 })

  useEffect(() => {
    setUserVote(null)
  }, [event?.id])

  if (!isOpen || !event) return null

  const handleVote = (vote: 'yes' | 'no') => {
    setUserVote(vote)
    onVote?.(event.id, vote)
  }

  const yesPercent = ((mockAggregate.yes / mockAggregate.total) * 100).toFixed(0)
  const noPercent = ((mockAggregate.no / mockAggregate.total) * 100).toFixed(0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CategoryTag category={event.category} />
            <h2 className="text-xl font-bold">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <div className="text-sm text-gray-500">
              {format(new Date(event.event_date), 'MMMM d, yyyy')}
              {event.event_time && ` at ${event.event_time.slice(0, 5)}`}
            </div>
            {event.primary_ticker && (
              <div className="text-sm font-semibold text-gray-700 mt-1">
                {event.primary_ticker}
              </div>
            )}
          </div>

          <p className="text-gray-700">{event.description}</p>

          <div>
            <p className="text-sm font-semibold mb-2">Will this impact stock price?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleVote('yes')}
                disabled={userVote !== null}
                className={`
                  flex-1 py-3 px-4 rounded-lg border-2 transition-all
                  ${userVote === 'yes' ? 'bg-green-100 border-green-500' : 'border-gray-300 hover:border-green-400'}
                  ${userVote !== null ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                `}
              >
                <div className="text-2xl">👍</div>
                <div className="text-sm font-medium">Impact</div>
              </button>
              <button
                onClick={() => handleVote('no')}
                disabled={userVote !== null}
                className={`
                  flex-1 py-3 px-4 rounded-lg border-2 transition-all
                  ${userVote === 'no' ? 'bg-red-100 border-red-500' : 'border-gray-300 hover:border-red-400'}
                  ${userVote !== null ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                `}
              >
                <div className="text-2xl">👎</div>
                <div className="text-sm font-medium">No Impact</div>
              </button>
            </div>
          </div>

          {userVote && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold">
                Your vote: {userVote === 'yes' ? '👍 Impact' : '👎 No Impact'}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>👍 Impact</span>
                  <span className="font-semibold">{yesPercent}% ({mockAggregate.yes})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${yesPercent}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>👎 No Impact</span>
                  <span className="font-semibold">{noPercent}% ({mockAggregate.no})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${noPercent}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {mockAggregate.total.toLocaleString()} total votes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
