'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrokerName } from '@/lib/types'

interface BrokerOption {
  id: BrokerName
  name: string
  description: string
  icon: string
  popular?: boolean
}

const BROKERS: BrokerOption[] = [
  {
    id: 'robinhood',
    name: 'Robinhood',
    description: 'Connect your Robinhood account',
    icon: 'RH',
    popular: true
  },
  {
    id: 'td_ameritrade',
    name: 'TD Ameritrade',
    description: 'Connect your TD Ameritrade account',
    icon: 'TD'
  },
  {
    id: 'etrade',
    name: 'E*TRADE',
    description: 'Connect your E*TRADE account',
    icon: 'ET'
  }
]

export default function PortfolioConnectPage() {
  const [connecting, setConnecting] = useState<BrokerName | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async (broker: BrokerName) => {
    setConnecting(broker)
    setError(null)

    try {
      const response = await fetch('/api/portfolio/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broker })
      })

      const data = await response.json()

      if (data.success) {
        // For MVP: Use mock callback URL
        // In production: window.location.href = data.authorization_url
        if (data.mock_callback_url) {
          // Simulate OAuth flow with mock callback
          window.location.href = data.mock_callback_url
        } else {
          window.location.href = data.authorization_url
        }
      } else {
        setError(data.error || 'Failed to initiate connection')
        setConnecting(null)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setConnecting(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Connect Your Portfolio
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Link your brokerage account to automatically track events for your holdings
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-center">{error}</p>
          </div>
        )}

        {/* Broker Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {BROKERS.map((broker) => (
            <button
              key={broker.id}
              onClick={() => handleConnect(broker.id)}
              disabled={connecting !== null}
              className="relative bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-left border-2 border-transparent hover:border-indigo-200"
            >
              {broker.popular && (
                <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Popular
                </div>
              )}

              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg mb-4">
                <span className="text-2xl font-bold text-indigo-600">{broker.icon}</span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {broker.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {broker.description}
              </p>

              {connecting === broker.id ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-indigo-600 font-medium">Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center text-indigo-600 font-medium">
                  <span>Connect</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-gray-500">
              Or select stocks manually
            </span>
          </div>
        </div>

        {/* Manual Entry Option */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Don't want to connect your broker?
          </h3>
          <p className="text-gray-600 mb-6">
            Manually select the stocks you want to track on your calendar
          </p>
          <Link
            href="/portfolio/manual"
            className="inline-block px-8 py-3 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-indigo-600"
          >
            Select Stocks Manually
          </Link>
        </div>

        {/* Security Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Your data is secure
              </h4>
              <p className="text-sm text-blue-800">
                We use bank-level encryption (AES-256) to protect your credentials. We only request read-only access to your portfolio and never have permission to make trades.
              </p>
            </div>
          </div>
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
