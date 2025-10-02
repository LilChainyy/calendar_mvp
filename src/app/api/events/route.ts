import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { and, gte, lte, eq, or, ilike, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const scope = searchParams.get('scope')
    const ticker = searchParams.get('ticker')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const conditions = []

    if (category && category !== 'all') {
      conditions.push(eq(events.category, category))
    }

    if (scope && scope !== 'all') {
      conditions.push(eq(events.impactScope, scope))
    }

    if (ticker) {
      conditions.push(
        or(
          ilike(events.primaryTicker, `%${ticker}%`),
          sql`${ticker}::text ILIKE ANY(${events.affectedTickers})`
        )
      )
    }

    if (startDate) {
      conditions.push(gte(events.eventDate, new Date(startDate)))
    }

    if (endDate) {
      conditions.push(lte(events.eventDate, new Date(endDate)))
    }

    const results = conditions.length > 0
      ? await db.select().from(events).where(and(...conditions))
      : await db.select().from(events)

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    })
  } catch (error) {
    console.error('Event API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load events' },
      { status: 500 }
    )
  }
}
