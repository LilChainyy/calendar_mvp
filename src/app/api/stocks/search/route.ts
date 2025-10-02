import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stocks } from '@/lib/db/schema'
import { or, ilike, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter "q" is required'
      }, { status: 400 })
    }

    const searchQuery = query.trim().toLowerCase()

    if (searchQuery.length < 1) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Search by ticker or name (case-insensitive)
    const results = await db
      .select({
        ticker: stocks.ticker,
        name: stocks.name,
        type: stocks.type,
        sector: stocks.sector
      })
      .from(stocks)
      .where(
        or(
          ilike(stocks.ticker, `%${searchQuery}%`),
          ilike(stocks.name, `%${searchQuery}%`)
        )
      )
      .limit(20) // Get more than 10 to allow for sorting

    // Sort results: exact ticker match first, then ticker starts with, then name match
    const sorted = results.sort((a, b) => {
      const aTickerLower = a.ticker.toLowerCase()
      const bTickerLower = b.ticker.toLowerCase()
      const aNameLower = a.name.toLowerCase()
      const bNameLower = b.name.toLowerCase()

      // Exact ticker match
      if (aTickerLower === searchQuery) return -1
      if (bTickerLower === searchQuery) return 1

      // Ticker starts with query
      const aTickerStarts = aTickerLower.startsWith(searchQuery)
      const bTickerStarts = bTickerLower.startsWith(searchQuery)
      if (aTickerStarts && !bTickerStarts) return -1
      if (!aTickerStarts && bTickerStarts) return 1

      // Ticker contains query
      const aTickerContains = aTickerLower.includes(searchQuery)
      const bTickerContains = bTickerLower.includes(searchQuery)
      if (aTickerContains && !bTickerContains) return -1
      if (!aTickerContains && bTickerContains) return 1

      // Name starts with query
      const aNameStarts = aNameLower.startsWith(searchQuery)
      const bNameStarts = bNameLower.startsWith(searchQuery)
      if (aNameStarts && !bNameStarts) return -1
      if (!aNameStarts && bNameStarts) return 1

      // Alphabetical by ticker
      return aTickerLower.localeCompare(bTickerLower)
    })

    // Limit to 10 results after sorting
    const limited = sorted.slice(0, 10)

    return NextResponse.json({
      success: true,
      data: limited,
      count: limited.length
    })
  } catch (error) {
    console.error('Stock search error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search stocks' },
      { status: 500 }
    )
  }
}
