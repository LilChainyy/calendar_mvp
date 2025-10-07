import { QuestionnaireData } from '@/components/OnboardingQuestionnaire'

export interface Stock {
  ticker: string
  name: string
  sector: string
  type: string
}

export interface StockRecommendation extends Stock {
  score: number
  reasons: string[]
}

// Stock categorization for recommendation algorithm
const CONSERVATIVE_STOCKS = ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'PFE', 'V', 'MA', 'JPM']
const MODERATE_STOCKS = ['GOOGL', 'AMZN', 'META', 'NFLX', 'CRM', 'ORCL', 'ADBE', 'BAC']
const AGGRESSIVE_STOCKS = ['TSLA', 'NVDA', 'AMD', 'BTC', 'ETH', 'HOOD']

const DAY_TRADING_STOCKS = ['TSLA', 'NVDA', 'AMD', 'BTC', 'ETH', 'META', 'HOOD']
const LONG_TERM_STOCKS = ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'JPM', 'V', 'MA', 'BRK.B']

const CELEBRITY_TRENDING_STOCKS = ['TSLA', 'NVDA', 'BTC', 'ETH', 'AAPL', 'META', 'AMD', 'HOOD']

// Sector mapping (normalize sector names)
const SECTOR_MAPPING: Record<string, string[]> = {
  Technology: ['Technology'],
  'Financial Services': ['Financial'],
  Healthcare: ['Healthcare'],
  Energy: ['Energy'],
  'Consumer Goods': ['Consumer Goods', 'Consumer Defensive', 'Consumer Cyclical'],
  Automotive: ['Automotive'],
  Cryptocurrency: ['Cryptocurrency'],
  Industrials: ['Industrials'],
  'Communication Services': ['Communication Services'],
}

export function generateRecommendations(
  preferences: QuestionnaireData,
  allStocks: Stock[]
): StockRecommendation[] {
  const recommendations: Map<string, StockRecommendation> = new Map()

  // Initialize all stocks with 0 score
  allStocks.forEach((stock) => {
    recommendations.set(stock.ticker, {
      ...stock,
      score: 0,
      reasons: [],
    })
  })

  // 1. SECTOR MATCH (40% weight) - 40 points max
  const selectedSectors = preferences.sectors
  const isAllSectors = selectedSectors.includes('All sectors / Not sure yet')

  allStocks.forEach((stock) => {
    const rec = recommendations.get(stock.ticker)!

    if (isAllSectors) {
      // If "All sectors" selected, give all stocks 20 points (half of max)
      rec.score += 20
      rec.reasons.push('Matches your broad sector interest')
    } else {
      // Check if stock sector matches any selected sector
      const matchingSector = selectedSectors.find((sector) => {
        const mappedSectors = SECTOR_MAPPING[sector] || [sector]
        return mappedSectors.some((mapped) => stock.sector.includes(mapped))
      })

      if (matchingSector) {
        rec.score += 40
        rec.reasons.push(`Matches your interest in ${matchingSector}`)
      }
    }
  })

  // 2. RISK TOLERANCE (30% weight) - 30 points max
  const riskLevel = parseInt(preferences.riskTolerance)

  allStocks.forEach((stock) => {
    const rec = recommendations.get(stock.ticker)!

    if (riskLevel <= 2) {
      // Conservative (1-2)
      if (CONSERVATIVE_STOCKS.includes(stock.ticker)) {
        rec.score += 30
        rec.reasons.push('Suitable for conservative risk tolerance')
      }
    } else if (riskLevel === 3) {
      // Moderate (3)
      if (MODERATE_STOCKS.includes(stock.ticker)) {
        rec.score += 30
        rec.reasons.push('Balanced risk profile')
      } else if (CONSERVATIVE_STOCKS.includes(stock.ticker)) {
        rec.score += 20
        rec.reasons.push('Stable investment option')
      }
    } else {
      // Aggressive (4-5)
      if (AGGRESSIVE_STOCKS.includes(stock.ticker)) {
        rec.score += 30
        rec.reasons.push('High growth potential for aggressive investors')
      } else if (MODERATE_STOCKS.includes(stock.ticker)) {
        rec.score += 15
        rec.reasons.push('Growth opportunity')
      }
    }
  })

  // 3. INVESTMENT TIMELINE (20% weight) - 20 points max
  const timeline = parseInt(preferences.investmentTimeline)

  allStocks.forEach((stock) => {
    const rec = recommendations.get(stock.ticker)!

    if (timeline <= 2) {
      // Day trading / Short term (1-2)
      if (DAY_TRADING_STOCKS.includes(stock.ticker)) {
        rec.score += 20
        rec.reasons.push('High volatility suitable for short-term trading')
      }
    } else if (timeline === 3) {
      // Medium term (3)
      // Give moderate scores to all types
      rec.score += 10
    } else {
      // Long term (4-5)
      if (LONG_TERM_STOCKS.includes(stock.ticker)) {
        rec.score += 20
        rec.reasons.push('Strong fundamentals for long-term holding')
      }
    }
  })

  // 4. PORTFOLIO STRATEGY (10% weight) - 10 points max
  allStocks.forEach((stock) => {
    const rec = recommendations.get(stock.ticker)!

    if (preferences.portfolioStrategy === 'celebrity') {
      // Celebrity follower
      if (CELEBRITY_TRENDING_STOCKS.includes(stock.ticker)) {
        rec.score += 10
        rec.reasons.push('Popular among investors and influencers')
      }
    } else if (preferences.portfolioStrategy === 'diy') {
      // DIY builder - already handled by sector matching
      // Give small boost to sector matches
      if (rec.reasons.some((r) => r.includes('Matches your interest'))) {
        rec.score += 5
      }
    } else if (preferences.portfolioStrategy === 'mix') {
      // Mix - balance both approaches
      if (CELEBRITY_TRENDING_STOCKS.includes(stock.ticker)) {
        rec.score += 5
        rec.reasons.push('Trending stock')
      }
      if (rec.reasons.some((r) => r.includes('Matches your interest'))) {
        rec.score += 5
      }
    }
  })

  // Convert to array and sort by score
  const sortedRecommendations = Array.from(recommendations.values())
    .sort((a, b) => b.score - a.score)
    .filter((rec) => rec.score > 0) // Only return stocks with some score

  // Return top 8-12 recommendations
  const topRecommendations = sortedRecommendations.slice(0, 12)

  // If we have less than 8, fill with highest scoring remaining stocks
  if (topRecommendations.length < 8) {
    const remaining = sortedRecommendations.slice(12)
    topRecommendations.push(...remaining.slice(0, 8 - topRecommendations.length))
  }

  return topRecommendations
}

// Helper function to format score as percentage
export function getScorePercentage(score: number): number {
  // Max possible score is 100 (40 + 30 + 20 + 10)
  return Math.round((score / 100) * 100)
}

// Get match quality label
export function getMatchQuality(score: number): {
  label: string
  color: string
} {
  const percentage = getScorePercentage(score)

  if (percentage >= 80) {
    return { label: 'Excellent Match', color: 'text-green-600' }
  } else if (percentage >= 60) {
    return { label: 'Good Match', color: 'text-blue-600' }
  } else if (percentage >= 40) {
    return { label: 'Moderate Match', color: 'text-yellow-600' }
  } else {
    return { label: 'Basic Match', color: 'text-gray-600' }
  }
}
