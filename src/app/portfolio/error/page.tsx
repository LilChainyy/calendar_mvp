'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PortfolioErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An unexpected error occurred'

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
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
            Connection Failed
          </h1>

          <p className="text-gray-600 mb-8">
            {message}
          </p>

          <div className="space-y-3">
            <Link
              href="/portfolio/connect"
              className="block w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/portfolio/manual"
              className="block w-full px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-300"
            >
              Select Stocks Manually
            </Link>
            <Link
              href="/calendar"
              className="block w-full text-gray-600 hover:text-gray-900 transition-colors mt-4"
            >
              Skip for now
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
