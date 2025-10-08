import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userPortfolios, portfolioHoldings } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * DELETE /api/portfolio/disconnect
 *
 * Disconnects a broker connection and removes associated holdings.
 *
 * Request body:
 * {
 *   portfolio_id: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: "Portfolio disconnected successfully"
 * }
 */

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { portfolio_id } = body

    if (!portfolio_id) {
      return NextResponse.json(
        { success: false, error: 'Portfolio ID is required' },
        { status: 400 }
      )
    }

    // Verify the portfolio belongs to the user
    const portfolio = await db
      .select()
      .from(userPortfolios)
      .where(
        and(
          eq(userPortfolios.id, portfolio_id),
          eq(userPortfolios.userId, userId)
        )
      )
      .limit(1)

    if (portfolio.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete the portfolio (holdings will be cascade deleted due to foreign key constraint)
    await db
      .delete(userPortfolios)
      .where(eq(userPortfolios.id, portfolio_id))

    return NextResponse.json({
      success: true,
      message: 'Portfolio disconnected successfully',
      broker_name: portfolio[0].brokerName
    })

  } catch (error) {
    console.error('Portfolio disconnect error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect portfolio' },
      { status: 500 }
    )
  }
}
