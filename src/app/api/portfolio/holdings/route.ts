import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userPortfolios, portfolioHoldings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/portfolio/holdings
 *
 * Retrieves user's current portfolio holdings across all connected brokers.
 *
 * Response:
 * {
 *   success: true,
 *   portfolios: [
 *     {
 *       id: string,
 *       broker_name: string,
 *       connection_status: string,
 *       last_sync_at: string,
 *       holdings: [
 *         { ticker, quantity, cost_basis, current_value, last_updated }
 *       ]
 *     }
 *   ]
 * }
 */

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 401 }
      )
    }

    // Get all user portfolios
    const portfolios = await db
      .select()
      .from(userPortfolios)
      .where(eq(userPortfolios.userId, userId))

    if (portfolios.length === 0) {
      return NextResponse.json({
        success: true,
        portfolios: [],
        message: 'No portfolios found. Connect a broker or add stocks manually.'
      })
    }

    // Get holdings for each portfolio
    const portfoliosWithHoldings = await Promise.all(
      portfolios.map(async (portfolio) => {
        const holdings = await db
          .select()
          .from(portfolioHoldings)
          .where(eq(portfolioHoldings.portfolioId, portfolio.id))

        return {
          id: portfolio.id,
          broker_name: portfolio.brokerName,
          connection_status: portfolio.connectionStatus,
          last_sync_at: portfolio.lastSyncAt?.toISOString() || null,
          created_at: portfolio.createdAt.toISOString(),
          holdings: holdings.map(holding => ({
            id: holding.id,
            ticker: holding.ticker,
            quantity: holding.quantity,
            cost_basis: holding.costBasis,
            current_value: holding.currentValue,
            last_updated: holding.lastUpdated.toISOString()
          }))
        }
      })
    )

    // Calculate summary statistics
    const totalHoldings = portfoliosWithHoldings.reduce(
      (sum, p) => sum + p.holdings.length,
      0
    )
    const uniqueTickers = new Set(
      portfoliosWithHoldings.flatMap(p => p.holdings.map(h => h.ticker))
    )

    return NextResponse.json({
      success: true,
      portfolios: portfoliosWithHoldings,
      summary: {
        total_portfolios: portfolios.length,
        total_holdings: totalHoldings,
        unique_tickers: uniqueTickers.size,
        connected_brokers: portfolios.filter(p => p.connectionStatus === 'connected').length
      }
    })

  } catch (error) {
    console.error('Portfolio holdings retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve portfolio holdings' },
      { status: 500 }
    )
  }
}
