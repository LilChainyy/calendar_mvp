import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userPortfolios, portfolioHoldings } from '@/lib/db/schema'
import { decryptToken } from '@/lib/crypto'
import { eq, and } from 'drizzle-orm'
import { BrokerName } from '@/lib/types'

/**
 * POST /api/portfolio/sync
 *
 * Synchronizes portfolio holdings from connected broker.
 * For MVP: Returns mock holdings data. In production: Fetches from broker API.
 *
 * Request body:
 * {
 *   portfolio_id?: string  // Optional: sync specific portfolio. If not provided, syncs all user portfolios
 * }
 *
 * Response:
 * {
 *   success: true,
 *   holdings: [...],
 *   last_sync_at: timestamp
 * }
 */

interface BrokerHolding {
  ticker: string
  quantity: number
  cost_basis?: number
  current_value?: number
}

/**
 * Mock holdings data for different brokers
 * TODO: Replace with actual broker API calls
 */
const MOCK_HOLDINGS: Record<BrokerName, BrokerHolding[]> = {
  robinhood: [
    { ticker: 'AAPL', quantity: 10, cost_basis: 150.00, current_value: 1750.50 },
    { ticker: 'TSLA', quantity: 5, cost_basis: 220.00, current_value: 1100.25 },
    { ticker: 'NVDA', quantity: 8, cost_basis: 450.00, current_value: 3600.00 },
    { ticker: 'MSFT', quantity: 15, cost_basis: 280.00, current_value: 4200.75 },
    { ticker: 'GOOGL', quantity: 6, cost_basis: 125.00, current_value: 750.30 },
  ],
  td_ameritrade: [
    { ticker: 'SPY', quantity: 20, cost_basis: 420.00, current_value: 8400.00 },
    { ticker: 'VOO', quantity: 12, cost_basis: 380.00, current_value: 4560.00 },
    { ticker: 'QQQ', quantity: 8, cost_basis: 350.00, current_value: 2800.00 },
    { ticker: 'AMZN', quantity: 10, cost_basis: 135.00, current_value: 1350.00 },
    { ticker: 'META', quantity: 7, cost_basis: 280.00, current_value: 1960.00 },
    { ticker: 'NFLX', quantity: 4, cost_basis: 450.00, current_value: 1800.00 },
  ],
  etrade: [
    { ticker: 'VTI', quantity: 25, cost_basis: 220.00, current_value: 5500.00 },
    { ticker: 'BND', quantity: 30, cost_basis: 75.00, current_value: 2250.00 },
    { ticker: 'AMD', quantity: 15, cost_basis: 95.00, current_value: 1425.00 },
    { ticker: 'INTC', quantity: 20, cost_basis: 35.00, current_value: 700.00 },
    { ticker: 'DIS', quantity: 12, cost_basis: 90.00, current_value: 1080.00 },
  ],
  manual: [] // Manual portfolios don't sync
}

/**
 * Fetch holdings from broker API
 * TODO: Replace with actual broker API integration
 */
async function fetchBrokerHoldings(
  broker: BrokerName,
  accessToken: string
): Promise<BrokerHolding[]> {
  // In production, this would make actual API calls:
  //
  // Robinhood example:
  // const response = await fetch('https://api.robinhood.com/positions/', {
  //   headers: { 'Authorization': `Bearer ${accessToken}` }
  // })
  // const data = await response.json()
  // return data.results.map(position => ({
  //   ticker: position.symbol,
  //   quantity: parseFloat(position.quantity),
  //   cost_basis: parseFloat(position.average_buy_price),
  //   current_value: parseFloat(position.market_value)
  // }))

  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))

  return MOCK_HOLDINGS[broker] || []
}

/**
 * In-memory rate limiter (simple implementation for MVP)
 * In production, use Redis or similar distributed cache
 */
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 1 // 1 request per minute per user

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const lastRequest = rateLimitMap.get(userId)

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return false // Rate limit exceeded
  }

  rateLimitMap.set(userId, now)
  return true
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 401 }
      )
    }

    // Rate limiting check
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait before syncing again.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { portfolio_id } = body

    // Get user's portfolios
    let portfoliosToSync
    if (portfolio_id) {
      portfoliosToSync = await db
        .select()
        .from(userPortfolios)
        .where(
          and(
            eq(userPortfolios.id, portfolio_id),
            eq(userPortfolios.userId, userId)
          )
        )
    } else {
      portfoliosToSync = await db
        .select()
        .from(userPortfolios)
        .where(eq(userPortfolios.userId, userId))
    }

    if (portfoliosToSync.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No portfolios found to sync' },
        { status: 404 }
      )
    }

    const allHoldings: any[] = []
    const syncTimestamp = new Date()

    // Sync each portfolio
    for (const portfolio of portfoliosToSync) {
      // Skip manual portfolios
      if (portfolio.brokerName === 'manual') {
        continue
      }

      // Check connection status
      if (portfolio.connectionStatus !== 'connected') {
        console.warn(`Portfolio ${portfolio.id} is not connected, skipping sync`)
        continue
      }

      try {
        // Decrypt access token
        const accessToken = portfolio.accessTokenEncrypted
          ? decryptToken(portfolio.accessTokenEncrypted)
          : null

        if (!accessToken) {
          await db
            .update(userPortfolios)
            .set({ connectionStatus: 'error' })
            .where(eq(userPortfolios.id, portfolio.id))
          continue
        }

        // Fetch holdings from broker
        const brokerHoldings = await fetchBrokerHoldings(
          portfolio.brokerName as BrokerName,
          accessToken
        )

        // Delete existing holdings for this portfolio
        await db
          .delete(portfolioHoldings)
          .where(eq(portfolioHoldings.portfolioId, portfolio.id))

        // Insert new holdings
        if (brokerHoldings.length > 0) {
          const holdingsToInsert = brokerHoldings.map(holding => ({
            portfolioId: portfolio.id,
            ticker: holding.ticker,
            quantity: holding.quantity.toString(),
            costBasis: holding.cost_basis?.toString() || null,
            currentValue: holding.current_value?.toString() || null,
            lastUpdated: syncTimestamp
          }))

          const insertedHoldings = await db
            .insert(portfolioHoldings)
            .values(holdingsToInsert)
            .returning()

          allHoldings.push(...insertedHoldings)
        }

        // Update portfolio sync timestamp
        await db
          .update(userPortfolios)
          .set({ lastSyncAt: syncTimestamp, updatedAt: syncTimestamp })
          .where(eq(userPortfolios.id, portfolio.id))

      } catch (error) {
        console.error(`Failed to sync portfolio ${portfolio.id}:`, error)
        await db
          .update(userPortfolios)
          .set({ connectionStatus: 'error' })
          .where(eq(userPortfolios.id, portfolio.id))
      }
    }

    return NextResponse.json({
      success: true,
      holdings: allHoldings,
      last_sync_at: syncTimestamp.toISOString(),
      portfolios_synced: portfoliosToSync.length
    })

  } catch (error) {
    console.error('Portfolio sync error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync portfolio' },
      { status: 500 }
    )
  }
}
