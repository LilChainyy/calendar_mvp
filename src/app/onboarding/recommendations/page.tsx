'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StockRecommendation } from '@/lib/recommendation-engine'
import { getScorePercentage, getMatchQuality } from '@/lib/recommendation-engine'

export default function RecommendationsPage() {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch('/api/onboarding/recommendations')

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }

        const data = await response.json()
        setRecommendations(data.recommendations)
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setError('Failed to load recommendations. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-600">Generating your personalized recommendations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/onboarding/questions')}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Personalized Recommendations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on your preferences, we've curated {recommendations.length} stocks that match your investment style.
          </p>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {recommendations.map((stock) => {
            const matchQuality = getMatchQuality(stock.score)
            const scorePercentage = getScorePercentage(stock.score)

            return (
              <div
                key={stock.ticker}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-indigo-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{stock.ticker}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${matchQuality.color}`}>
                      {matchQuality.label}
                    </div>
                    <div className="text-xs text-gray-500">{scorePercentage}% match</div>
                  </div>
                </div>

                {/* Sector Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    {stock.sector}
                  </span>
                </div>

                {/* Match Score Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${scorePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Reasons */}
                <div className="space-y-2 mb-4">
                  {stock.reasons.slice(0, 2).map((reason, idx) => (
                    <div key={idx} className="flex items-start text-sm text-gray-700">
                      <svg
                        className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="line-clamp-2">{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Link
                  href={`/calendar?ticker=${stock.ticker}`}
                  className="block w-full px-4 py-2 bg-indigo-600 text-white text-center font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  See Events
                </Link>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">
              We couldn't find any recommendations. Try adjusting your preferences.
            </p>
            <button
              onClick={() => router.push('/onboarding/questions')}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Adjust Preferences
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to start tracking?
          </h2>
          <p className="text-gray-600 mb-6">
            Head to your personalized calendar to see upcoming earnings, Fed meetings, and market-moving events for your recommended stocks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/calendar"
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Go to Calendar
            </Link>
            <button
              onClick={() => router.push('/onboarding/questions')}
              className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-300"
            >
              Adjust Preferences
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            You can always update your preferences in settings
          </p>
        </div>
      </div>
    </div>
  )
}
