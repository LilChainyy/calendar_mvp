'use client'

import { useRouter } from 'next/navigation'
import CandlestickChart from '@/components/CandlestickChart'

export default function NVDAStockPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to home"
            >
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                NVDA - NVIDIA Corporation
              </h1>
              <p className="text-sm text-gray-500 mt-1">Technology · Semiconductors</p>
            </div>
          </div>
        </div>

        {/* Candlestick Chart */}
        <CandlestickChart ticker="NVDA" />
      </div>
    </main>
  )
}
