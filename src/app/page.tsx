import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Stock Event Calendar
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track, organize, and vote on market-moving events. Stay ahead of earnings, Fed policy, and economic data releases.
          </p>
          <Link
            href="/calendar"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started →
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Event Tracking</h3>
            <p className="text-gray-600">
              Monitor earnings calls, economic data releases, Fed policy decisions, and regulatory announcements all in one place.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🗳️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Voting</h3>
            <p className="text-gray-600">
              Vote on event outcomes and see what the community thinks. Track sentiment before market-moving announcements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Calendar</h3>
            <p className="text-gray-600">
              Drag and drop events to organize your personal calendar. Filter by category, ticker, or impact scope.
            </p>
          </div>
        </div>

        {/* Event Categories */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Event Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📊</div>
              <p className="font-medium text-gray-900">Earnings</p>
              <p className="text-sm text-gray-500">Quarterly reports</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📈</div>
              <p className="font-medium text-gray-900">Economic Data</p>
              <p className="text-sm text-gray-500">CPI, jobs, GDP</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🏛️</div>
              <p className="font-medium text-gray-900">Fed Policy</p>
              <p className="text-sm text-gray-500">Rate decisions</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">💊</div>
              <p className="font-medium text-gray-900">Regulatory</p>
              <p className="text-sm text-gray-500">FDA, SEC rulings</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🤝</div>
              <p className="font-medium text-gray-900">Corporate Actions</p>
              <p className="text-sm text-gray-500">M&A, launches</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🌍</div>
              <p className="font-medium text-gray-900">Macro Events</p>
              <p className="text-sm text-gray-500">Global markets</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🏛️</div>
              <p className="font-medium text-gray-900">Gov Policy</p>
              <p className="text-sm text-gray-500">Elections, bills</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🎯</div>
              <p className="font-medium text-gray-900">And More</p>
              <p className="text-sm text-gray-500">Market events</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/calendar"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Open Calendar →
          </Link>
        </div>
      </div>
    </main>
  )
}
