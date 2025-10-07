'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { generateStockPriceData, getPriceChange, getCurrentPrice } from '@/lib/stockPriceData'
import { format, parseISO } from 'date-fns'

interface StockChartProps {
  ticker: string
}

export default function StockChart({ ticker }: StockChartProps) {
  const priceData = useMemo(() => generateStockPriceData(ticker), [ticker])
  const currentPrice = useMemo(() => getCurrentPrice(ticker), [ticker])
  const { change, changePercent } = useMemo(() => getPriceChange(ticker), [ticker])

  const isPositive = change >= 0

  // Format date for tooltip
  const formatTooltipDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-600 mb-1">
            {formatTooltipDate(payload[0].payload.date)}
          </p>
          <p className="text-lg font-semibold text-gray-900">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      )
    }
    return null
  }

  // Format Y-axis values
  const formatYAxis = (value: number) => {
    return `$${value.toFixed(0)}`
  }

  // Format X-axis dates - show only some dates to avoid crowding
  const formatXAxis = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d')
    } catch {
      return ''
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Price Movement - Last 90 Days
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div>
            <span className="text-3xl font-bold text-gray-900">
              ${currentPrice.toFixed(2)}
            </span>
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>
              {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isPositive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              )}
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {formatTooltipDate(priceData[priceData.length - 1].date)}
        </p>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={priceData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              domain={['dataMin - 5', 'dataMax + 5']}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#10b981' : '#3b82f6'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Historical price data is simulated for demonstration purposes. This is not real market data.
        </p>
      </div>
    </div>
  )
}
