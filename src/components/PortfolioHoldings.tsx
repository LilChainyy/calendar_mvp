'use client'

import { useState, useEffect } from 'react'
import { BrokerName, ConnectionStatus } from '@/lib/types'

interface Holding {
  id: string
  ticker: string
  quantity: string | number
  cost_basis: string | number | null
  current_value: string | number | null
  last_updated: string
}

interface Portfolio {
  id: string
  broker_name: BrokerName
  connection_status: ConnectionStatus
  last_sync_at: string | null
  holdings: Holding[]
}

interface PortfolioData {
  portfolios: Portfolio[]
  summary: {
    total_portfolios: number
    total_holdings: number
    unique_tickers: number
    connected_brokers: number
  }
}

export default function PortfolioHoldings() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [showDisconnectModal, setShowDisconnectModal] = useState<string | null>(null)

  useEffect(() => {
    loadHoldings()
  }, [])

  const loadHoldings = async () => {
    try {
      const response = await fetch('/api/portfolio/holdings')
      const result = await response.json()

      if (result.success) {
        setData(result)
      } else {
        setError(result.error || 'Failed to load holdings')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (portfolioId: string) => {
    setSyncing(portfolioId)
    setError(null)

    try {
      const response = await fetch('/api/portfolio/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio_id: portfolioId })
      })

      const result = await response.json()

      if (result.success) {
        await loadHoldings() // Reload holdings after sync
      } else {
        setError(result.error || 'Failed to sync portfolio')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSyncing(null)
    }
  }

  const handleDisconnect = async (portfolioId: string) => {
    setDisconnecting(portfolioId)
    setError(null)

    try {
      const response = await fetch('/api/portfolio/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio_id: portfolioId })
      })

      const result = await response.json()

      if (result.success) {
        await loadHoldings() // Reload holdings after disconnect
        setShowDisconnectModal(null)
      } else {
        setError(result.error || 'Failed to disconnect portfolio')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setDisconnecting(null)
    }
  }

  const getBrokerDisplayName = (broker: BrokerName): string => {
    const names: Record<BrokerName, string> = {
      robinhood: 'Robinhood',
      td_ameritrade: 'TD Ameritrade',
      etrade: 'E*TRADE',
      manual: 'Manual Selection'
    }
    return names[broker]
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (!data || data.portfolios.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Portfolio Connected
        </h3>
        <p className="text-gray-600 mb-6">
          Connect your brokerage account or manually select stocks to get started
        </p>
        <a
          href="/portfolio/connect"
          className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Connect Portfolio
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Portfolios</p>
            <p className="text-2xl font-bold text-indigo-600">{data.summary.total_portfolios}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Holdings</p>
            <p className="text-2xl font-bold text-indigo-600">{data.summary.total_holdings}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Unique Stocks</p>
            <p className="text-2xl font-bold text-indigo-600">{data.summary.unique_tickers}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Connected</p>
            <p className="text-2xl font-bold text-indigo-600">{data.summary.connected_brokers}</p>
          </div>
        </div>
      </div>

      {/* Portfolio Cards */}
      {data.portfolios.map((portfolio) => (
        <div key={portfolio.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Portfolio Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">
                  {getBrokerDisplayName(portfolio.broker_name)}
                </h3>
                <p className="text-indigo-100 text-sm">
                  Last synced: {formatDate(portfolio.last_sync_at)}
                </p>
              </div>
              <div className="flex gap-2">
                {portfolio.broker_name !== 'manual' && (
                  <button
                    onClick={() => handleSync(portfolio.id)}
                    disabled={syncing === portfolio.id}
                    className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncing === portfolio.id ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        Syncing...
                      </span>
                    ) : (
                      'Sync Now'
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowDisconnectModal(portfolio.id)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
                >
                  Disconnect
                </button>
              </div>
            </div>
            <div className="text-sm">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full">
                {portfolio.holdings.length} {portfolio.holdings.length === 1 ? 'holding' : 'holdings'}
              </span>
            </div>
          </div>

          {/* Holdings List */}
          {portfolio.holdings.length > 0 ? (
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {portfolio.holdings.map((holding) => (
                  <div
                    key={holding.id}
                    className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-mono font-bold text-lg text-gray-900">
                      {holding.ticker}
                    </p>
                    {portfolio.broker_name !== 'manual' && (
                      <p className="text-sm text-gray-600 mt-1">
                        {parseFloat(holding.quantity.toString()).toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600">
              No holdings found
            </div>
          )}

          {/* Disconnect Confirmation Modal */}
          {showDisconnectModal === portfolio.id && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Disconnect {getBrokerDisplayName(portfolio.broker_name)}?
                </h3>
                <p className="text-gray-600 mb-6">
                  This will remove this portfolio connection and all associated holdings. You can reconnect at any time.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDisconnect(portfolio.id)}
                    disabled={disconnecting === portfolio.id}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {disconnecting === portfolio.id ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                  <button
                    onClick={() => setShowDisconnectModal(null)}
                    disabled={disconnecting === portfolio.id}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
