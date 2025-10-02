import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stocks } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

interface RouteParams {
  params: {
    ticker: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { ticker } = params

    if (!ticker) {
      return NextResponse.json({
        success: false,
        error: 'Ticker is required'
      }, { status: 400 })
    }

    // Search for stock by ticker (case-insensitive)
    const result = await db
      .select()
      .from(stocks)
      .where(sql`LOWER(${stocks.ticker}) = LOWER(${ticker})`)
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Stock with ticker "${ticker}" not found`
      }, { status: 404 })
    }

    const stock = result[0]

    // Return stock details (market_cap would come from a real API in production)
    return NextResponse.json({
      success: true,
      data: {
        ticker: stock.ticker,
        name: stock.name,
        type: stock.type,
        sector: stock.sector,
        createdAt: stock.createdAt
      }
    })
  } catch (error) {
    console.error('Stock details error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock details' },
      { status: 500 }
    )
  }
}
