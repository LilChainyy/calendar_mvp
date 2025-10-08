import PortfolioHoldings from '@/components/PortfolioHoldings'
import Link from 'next/link'

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Portfolio
            </h1>
            <p className="text-lg text-gray-600">
              Manage your connected brokerage accounts and holdings
            </p>
          </div>
          <Link
            href="/portfolio/connect"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Portfolio
          </Link>
        </div>

        {/* Portfolio Holdings Component */}
        <PortfolioHoldings />

        {/* Back to Calendar */}
        <div className="mt-8 text-center">
          <Link
            href="/calendar"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to Calendar
          </Link>
        </div>
      </div>
    </main>
  )
}
