'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ManualPortfolioPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTickers, setSelectedTickers] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(true)

  // Load existing manual portfolio on mount
  useEffect(() => {
    async function loadExistingPortfolio() {
      try {
        const response = await fetch('/api/portfolio/manual')
        const data = await response.json()

        if (data.success && data.holdings && data.holdings.length > 0) {
          const tickers = data.holdings.map((h: any) => h.ticker)
          setSelectedTickers(tickers)
        }
      } catch (err) {
        console.error('Failed to load existing portfolio:', err)
      } finally {
        setLoadingExisting(false)
      }
    }

    loadExistingPortfolio()
  }, [])

  const handleAddTicker = () => {
    const ticker = searchQuery.trim().toUpperCase()

    if (!ticker) return

    // Basic validation
    if (!/^[A-Z]{1,5}$/.test(ticker)) {
      setError('Invalid ticker format. Must be 1-5 uppercase letters.')
      return
    }

    if (selectedTickers.includes(ticker)) {
      setError('Ticker already added')
      return
    }

    if (selectedTickers.length >= 50) {
      setError('Maximum 50 tickers allowed')
      return
    }

    setSelectedTickers([...selectedTickers, ticker])
    setSearchQuery('')
    setError(null)
  }

  const handleRemoveTicker = (ticker: string) => {
    setSelectedTickers(selectedTickers.filter(t => t !== ticker))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTicker()
    }
  }

  const handleSubmit = async () => {
    if (selectedTickers.length === 0) {
      setError('Please add at least one ticker')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/portfolio/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers: selectedTickers })
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to calendar
        router.push('/calendar?portfolio=manual')
      } else {
        setError(data.error || 'Failed to save portfolio')
        setSubmitting(false)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  // Popular stocks for quick add
  const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-indigo-100 rounded-full mb-6">
            <svg
              className="w-16 h-16 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Select Your Stocks
          </h1>
          <p className="text-lg text-gray-600">
            Add the stocks you want to track on your calendar
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Stock Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Add Stock Ticker
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="e.g., AAPL, GOOGL, TSLA"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none text-lg font-mono uppercase"
                maxLength={5}
              />
              <button
                onClick={handleAddTicker}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter stock tickers (1-5 letters). Press Enter or click Add.
            </p>
          </div>

          {/* Popular Stocks Quick Add */}
          {selectedTickers.length === 0 && !loadingExisting && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Popular Stocks
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularStocks.map((ticker) => (
                  <button
                    key={ticker}
                    onClick={() => {
                      setSearchQuery(ticker)
                      setTimeout(() => handleAddTicker(), 100)
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors text-sm font-medium"
                  >
                    {ticker}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Tickers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Selected Stocks ({selectedTickers.length}/50)
            </h3>

            {loadingExisting ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : selectedTickers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-gray-600">No stocks selected yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add tickers above to start building your portfolio
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                {selectedTickers.map((ticker) => (
                  <div
                    key={ticker}
                    className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200"
                  >
                    <span className="font-mono font-semibold text-gray-900">
                      {ticker}
                    </span>
                    <button
                      onClick={() => handleRemoveTicker(ticker)}
                      className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedTickers.length === 0}
            className="flex-1 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </span>
            ) : (
              'Save Portfolio'
            )}
          </button>
          <Link
            href="/portfolio/connect"
            className="flex-1 px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-300 text-center"
          >
            Connect Broker Instead
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/calendar" className="text-gray-600 hover:text-gray-900 transition-colors">
            Skip for now
          </Link>
        </div>
      </div>
    </main>
  )
}
