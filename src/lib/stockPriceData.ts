import { subDays, format, addDays, isWeekend, parseISO } from 'date-fns'

export interface PriceDataPoint {
  date: string
  price: number
}

export interface OHLCDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface ProjectionDataPoint {
  date: string
  projectedPrice: number
}

// Base prices for different stocks (realistic as of Oct 2025)
const basePrices: Record<string, number> = {
  AAPL: 180,
  MSFT: 350,
  GOOGL: 140,
  AMZN: 145,
  NVDA: 450,
  META: 320,
  TSLA: 250,
  'BRK.B': 380,
  V: 265,
  UNH: 480,
  JNJ: 160,
  WMT: 165,
  JPM: 150,
  MA: 450,
  PG: 155,
  XOM: 110,
  HD: 340,
  CVX: 155,
  MRK: 105,
  ABBV: 170,
  KO: 62,
  PEP: 175,
  COST: 720,
  AVGO: 1300,
  TMO: 550,
  MCD: 295,
  CSCO: 55,
  ABT: 115,
  ACN: 360,
  ORCL: 145,
  NKE: 95,
  CRM: 280,
  NFLX: 520,
  AMD: 165,
  DIS: 95,
  ADBE: 560,
  INTC: 42,
  PFE: 30,
  CMCSA: 42,
  VZ: 40,
  T: 20,
  BAC: 35,
  WFC: 55,
  MS: 95,
  GS: 420,
  BMY: 55,
  QCOM: 175,
  TXN: 195,
  UPS: 155,
  CAT: 340,
  HOOD: 25,
}

/**
 * Generate 90 days of mock historical price data for a given ticker
 * @param ticker - The stock ticker symbol
 * @returns Array of price data points with date and price
 */
export function generateStockPriceData(ticker: string): PriceDataPoint[] {
  const basePrice = basePrices[ticker] || 100
  const data: PriceDataPoint[] = []

  // Generate data for the last 90 days
  for (let i = 89; i >= 0; i--) {
    const date = subDays(new Date(), i)

    // Create realistic price movement with:
    // - Daily volatility (0.5% to 3% based on stock)
    // - Slight upward trend (0.01% per day on average)
    // - Some randomness for realistic variation

    const volatility = ticker === 'TSLA' || ticker === 'NVDA' || ticker === 'AMD' ? 0.03 :
                       ticker === 'HOOD' || ticker === 'NFLX' ? 0.025 : 0.015

    const dailyChange = (Math.random() - 0.48) * volatility
    const trendFactor = 1 + (i / 90) * 0.1 // Slight upward trend from 90 days ago to now

    const price = basePrice * trendFactor * (1 + dailyChange)

    data.push({
      date: format(date, 'yyyy-MM-dd'),
      price: parseFloat(price.toFixed(2))
    })
  }

  // Smooth the data slightly to make it more realistic (moving average)
  const smoothedData = data.map((point, index) => {
    if (index === 0 || index === data.length - 1) return point

    const prevPrice = data[index - 1].price
    const nextPrice = index < data.length - 1 ? data[index + 1].price : point.price
    const smoothedPrice = (prevPrice + point.price + nextPrice) / 3

    return {
      ...point,
      price: parseFloat(smoothedPrice.toFixed(2))
    }
  })

  return smoothedData
}

/**
 * Get the current price (most recent) for a ticker
 */
export function getCurrentPrice(ticker: string): number {
  const data = generateStockPriceData(ticker)
  return data[data.length - 1].price
}

/**
 * Get the price change over the period
 */
export function getPriceChange(ticker: string): { change: number; changePercent: number } {
  const data = generateStockPriceData(ticker)
  const startPrice = data[0].price
  const endPrice = data[data.length - 1].price
  const change = endPrice - startPrice
  const changePercent = (change / startPrice) * 100

  return {
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2))
  }
}

/**
 * Generate OHLC candlestick data from July 1, 2025 to today
 * @param ticker - The stock ticker symbol
 * @returns Array of OHLC data points (excluding weekends)
 */
export function generateOHLCData(ticker: string): OHLCDataPoint[] {
  const basePrice = basePrices[ticker] || 100
  const data: OHLCDataPoint[] = []

  // Start date: July 1, 2025
  const startDate = new Date(2025, 6, 1) // Month is 0-indexed
  const today = new Date()

  let currentDate = new Date(startDate)
  let lastClose = basePrice * 0.85 // Start a bit lower to show growth

  while (currentDate <= today) {
    // Skip weekends
    if (!isWeekend(currentDate)) {
      // Volatility for NVDA is higher
      const volatility = ticker === 'NVDA' ? 0.03 :
                        ticker === 'TSLA' || ticker === 'AMD' ? 0.025 : 0.015

      // Generate daily movement
      const dailyChange = (Math.random() - 0.47) * volatility // Slight upward bias
      const open = lastClose

      // Generate high and low based on intraday volatility
      const intradayVolatility = volatility * 0.5
      const high = open * (1 + Math.abs(Math.random() * intradayVolatility))
      const low = open * (1 - Math.abs(Math.random() * intradayVolatility))
      const close = open * (1 + dailyChange)

      // Ensure high is highest and low is lowest
      const actualHigh = Math.max(high, open, close)
      const actualLow = Math.min(low, open, close)

      data.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(actualHigh.toFixed(2)),
        low: parseFloat(actualLow.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(Math.random() * 100000000) + 50000000 // Random volume
      })

      lastClose = close
    }

    currentDate = addDays(currentDate, 1)
  }

  return data
}

/**
 * Generate projection data from tomorrow to Dec 31, 2025
 * @param ticker - The stock ticker symbol
 * @param ohlcData - Historical OHLC data to base projection on
 * @returns Array of projection data points (excluding weekends) - flat line at current price
 */
export function generateProjectionData(
  ticker: string,
  ohlcData: OHLCDataPoint[]
): ProjectionDataPoint[] {
  if (ohlcData.length === 0) return []

  const data: ProjectionDataPoint[] = []
  const lastPrice = ohlcData[ohlcData.length - 1].close

  // Start from tomorrow
  const tomorrow = addDays(new Date(), 1)
  // End date: December 31, 2025
  const endDate = new Date(2025, 11, 31) // Month is 0-indexed

  let currentDate = new Date(tomorrow)

  while (currentDate <= endDate) {
    // Skip weekends
    if (!isWeekend(currentDate)) {
      // Flat line projection at the last closing price
      data.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        projectedPrice: lastPrice
      })
    }

    currentDate = addDays(currentDate, 1)
  }

  return data
}
