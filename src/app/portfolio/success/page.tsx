'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PortfolioSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const broker = searchParams.get('broker')
  const [syncing, setSyncing] = useState(true)
  const [syncError, setSyncError] = useState(false)

  useEffect(() => {
    // Automatically trigger portfolio sync after successful connection
    async function syncPortfolio() {
      try {
        const response = await fetch('/api/portfolio/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })

        const data = await response.json()

        if (data.success) {
          // Wait a moment to show success state
          await new Promise(resolve => setTimeout(resolve, 1500))
          setSyncing(false)

          // Redirect to calendar after 2 seconds
          setTimeout(() => {
            router.push('/calendar?portfolio=connected')
          }, 2000)
        } else {
          setSyncError(true)
          setSyncing(false)
        }
      } catch (error) {
        console.error('Sync error:', error)
        setSyncError(true)
        setSyncing(false)
      }
    }

    syncPortfolio()
  }, [router])

  const getBrokerDisplayName = (brokerKey: string | null): string => {
    const brokerNames: Record<string, string> = {
      robinhood: 'Robinhood',
      td_ameritrade: 'TD Ameritrade',
      etrade: 'E*TRADE'
    }
    return brokerKey ? brokerNames[brokerKey] || brokerKey : 'your broker'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {syncing ? (
            <>
              {/* Syncing State */}
              <div className="inline-block p-4 bg-indigo-100 rounded-full mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Syncing Your Portfolio
              </h1>
              <p className="text-gray-600 mb-6">
                We're fetching your holdings from {getBrokerDisplayName(broker)}...
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2 animate-pulse"></div>
                  Connecting to {getBrokerDisplayName(broker)}
                </div>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  Fetching your holdings
                </div>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  Updating your calendar
                </div>
              </div>
            </>
          ) : syncError ? (
            <>
              {/* Error State */}
              <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
                <svg
                  className="w-16 h-16 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Sync Failed
              </h1>
              <p className="text-gray-600 mb-6">
                We couldn't sync your portfolio right now. You can try again later from your calendar.
              </p>
              <button
                onClick={() => router.push('/calendar')}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Calendar
              </button>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
                <svg
                  className="w-16 h-16 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Portfolio Connected!
              </h1>
              <p className="text-gray-600 mb-6">
                Your {getBrokerDisplayName(broker)} account is now connected. Redirecting to your calendar...
              </p>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            </>
          )}
        </div>

        {/* Manual redirect link in case auto-redirect fails */}
        {!syncing && !syncError && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/calendar')}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              Click here if you're not redirected
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
