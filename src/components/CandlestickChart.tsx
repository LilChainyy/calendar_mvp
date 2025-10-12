'use client'

import { useMemo, useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { generateOHLCData, generateProjectionData, OHLCDataPoint, ProjectionDataPoint } from '@/lib/stockPriceData'
import { format, parseISO } from 'date-fns'

interface CandlestickChartProps {
  ticker: string
}

export default function CandlestickChart({ ticker }: CandlestickChartProps) {
  const [ohlcData, setOhlcData] = useState<OHLCDataPoint[]>([])
  const [projectionData, setProjectionData] = useState<ProjectionDataPoint[]>([])
  const [isClient, setIsClient] = useState(false)

  // Generate data only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    const ohlc = generateOHLCData(ticker)
    const projection = generateProjectionData(ticker, ohlc)
    setOhlcData(ohlc)
    setProjectionData(projection)
  }, [ticker])

  // Combine data for the chart - use only closing prices
  const combinedData = useMemo(() => {
    const historical = ohlcData.map(d => ({
      date: d.date,
      price: d.close,
      type: 'historical' as const
    }))

    const projection = projectionData.map(d => ({
      date: d.date,
      projectedPrice: d.projectedPrice,
      type: 'projection' as const
    }))

    return [...historical, ...projection]
  }, [ohlcData, projectionData])

  // Get current price and stats
  const currentPrice = ohlcData.length > 0 ? ohlcData[ohlcData.length - 1].close : 0
  const startPrice = ohlcData.length > 0 ? ohlcData[0].open : 0
  const change = currentPrice - startPrice
  const changePercent = startPrice > 0 ? (change / startPrice) * 100 : 0
  const isPositive = change >= 0

  // Calculate domain for Y axis - must be before conditional return to maintain hook order
  const yDomain = useMemo(() => {
    const historicalPrices = ohlcData.map(d => d.close)
    const projectedPrices = projectionData.map(d => d.projectedPrice)
    const allPrices = [...historicalPrices, ...projectedPrices]

    if (allPrices.length === 0) return [0, 100]

    const min = Math.min(...allPrices)
    const max = Math.max(...allPrices)
    const padding = (max - min) * 0.1

    return [min - padding, max + padding]
  }, [ohlcData, projectionData])

  // Show loading state during SSR and initial render
  if (!isClient || ohlcData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-center" style={{ height: '500px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        </div>
      </div>
    )
  }

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
      const data = payload[0].payload

      if (data.type === 'historical') {
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <p className="text-sm text-gray-600 mb-1">
              {formatTooltipDate(data.date)}
            </p>
            <p className="text-lg font-semibold text-gray-900">
              ${data.price.toFixed(2)}
            </p>
          </div>
        )
      } else if (data.type === 'projection') {
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <p className="text-sm text-gray-600 mb-1">
              {formatTooltipDate(data.date)}
            </p>
            <p className="text-xs text-gray-500 mb-2">Projected</p>
            <p className="text-lg font-semibold text-gray-700">
              ${data.projectedPrice.toFixed(2)}
            </p>
          </div>
        )
      }
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
      const date = parseISO(dateStr)
      // Show month and day
      return format(date, 'MMM d')
    } catch {
      return ''
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Stock Price Chart
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
        <p className="text-sm text-gray-500 mt-2">
          Historical: Jul 1, 2025 - Today · Projection: Tomorrow - Dec 31, 2025
        </p>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={combinedData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
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
              minTickGap={60}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              domain={yDomain}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Solid line for historical closing prices */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />

            {/* Dotted grey line for projection */}
            <Line
              type="monotone"
              dataKey="projectedPrice"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500 rounded"></div>
            <span>Historical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gray-400 rounded" style={{ borderTop: '2px dashed #9ca3af' }}></div>
            <span>Projected</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Historical price data is simulated for demonstration purposes. Projections are illustrative only and not financial advice.
        </p>
      </div>
    </div>
  )
}
