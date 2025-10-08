import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userPortfolios, portfolioHoldings } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * POST /api/portfolio/manual
 *
 * Creates or updates a manual portfolio with selected tickers.
 * This is for users who don't want to connect a broker account.
 *
 * Request body:
 * {
 *   tickers: string[]  // Array of stock tickers (e.g., ['AAPL', 'GOOGL', 'MSFT'])
 * }
 *
 * Response:
 * {
 *   success: true,
 *   portfolio_id: string,
 *   holdings: [...],
 *   message: "Manual portfolio created/updated successfully"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tickers } = body as { tickers: string[] }

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tickers array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Validate tickers (basic validation)
    const validatedTickers = tickers
      .map(t => t.trim().toUpperCase())
      .filter(t => /^[A-Z]{1,5}$/.test(t)) // Basic ticker format: 1-5 uppercase letters

    if (validatedTickers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid tickers provided. Tickers must be 1-5 uppercase letters.' },
        { status: 400 }
      )
    }

    if (validatedTickers.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 tickers allowed for manual portfolio' },
        { status: 400 }
      )
    }

    // Check if user already has a manual portfolio
    const existingManualPortfolio = await db
      .select()
      .from(userPortfolios)
      .where(
        and(
          eq(userPortfolios.userId, userId),
          eq(userPortfolios.brokerName, 'manual')
        )
      )
      .limit(1)

    let portfolioId: string

    if (existingManualPortfolio.length > 0) {
      // Update existing manual portfolio
      portfolioId = existingManualPortfolio[0].id

      // Update timestamp
      await db
        .update(userPortfolios)
        .set({ updatedAt: new Date() })
        .where(eq(userPortfolios.id, portfolioId))

      // Delete existing holdings
      await db
        .delete(portfolioHoldings)
        .where(eq(portfolioHoldings.portfolioId, portfolioId))
    } else {
      // Create new manual portfolio
      const newPortfolio = await db
        .insert(userPortfolios)
        .values({
          userId,
          brokerName: 'manual',
          connectionStatus: 'connected'
        })
        .returning()

      portfolioId = newPortfolio[0].id
    }

    // Insert new holdings (quantity = 1 for tracking purposes)
    const holdingsToInsert = validatedTickers.map(ticker => ({
      portfolioId,
      ticker,
      quantity: '1', // Just for tracking, not actual shares
      costBasis: null,
      currentValue: null,
      lastUpdated: new Date()
    }))

    const insertedHoldings = await db
      .insert(portfolioHoldings)
      .values(holdingsToInsert)
      .returning()

    return NextResponse.json({
      success: true,
      portfolio_id: portfolioId,
      holdings: insertedHoldings.map(h => ({
        id: h.id,
        ticker: h.ticker,
        quantity: h.quantity,
        last_updated: h.lastUpdated.toISOString()
      })),
      message: existingManualPortfolio.length > 0
        ? 'Manual portfolio updated successfully'
        : 'Manual portfolio created successfully',
      tickers_added: validatedTickers.length
    })

  } catch (error) {
    console.error('Manual portfolio creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create/update manual portfolio' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/portfolio/manual
 *
 * Retrieves the user's manual portfolio if it exists.
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

    // Get manual portfolio
    const manualPortfolio = await db
      .select()
      .from(userPortfolios)
      .where(
        and(
          eq(userPortfolios.userId, userId),
          eq(userPortfolios.brokerName, 'manual')
        )
      )
      .limit(1)

    if (manualPortfolio.length === 0) {
      return NextResponse.json({
        success: true,
        portfolio: null,
        holdings: []
      })
    }

    // Get holdings
    const holdings = await db
      .select()
      .from(portfolioHoldings)
      .where(eq(portfolioHoldings.portfolioId, manualPortfolio[0].id))

    return NextResponse.json({
      success: true,
      portfolio: {
        id: manualPortfolio[0].id,
        created_at: manualPortfolio[0].createdAt.toISOString(),
        updated_at: manualPortfolio[0].updatedAt.toISOString()
      },
      holdings: holdings.map(h => ({
        id: h.id,
        ticker: h.ticker,
        quantity: h.quantity,
        last_updated: h.lastUpdated.toISOString()
      }))
    })

  } catch (error) {
    console.error('Manual portfolio retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve manual portfolio' },
      { status: 500 }
    )
  }
}
