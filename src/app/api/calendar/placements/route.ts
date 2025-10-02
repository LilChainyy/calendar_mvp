import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import { placements } from '@/lib/db/schema'
import { and, eq, gte, lte, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const stockTicker = searchParams.get('stockTicker')

    const conditions = [eq(placements.userId, userId)]

    // Filter by stock ticker if provided
    // null = global calendar, 'AAPL' = AAPL-specific calendar
    if (stockTicker !== undefined) {
      if (stockTicker === null || stockTicker === 'null') {
        conditions.push(sql`${placements.stockTicker} IS NULL`)
      } else {
        conditions.push(eq(placements.stockTicker, stockTicker))
      }
    }

    if (startDate) {
      conditions.push(gte(placements.date, startDate))
    }

    if (endDate) {
      conditions.push(lte(placements.date, endDate))
    }

    const userPlacements = await db.select().from(placements).where(
      and(...conditions)
    )

    return NextResponse.json({
      success: true,
      data: userPlacements
    })
  } catch (error) {
    console.error('Placement retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve placements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { eventId, date, stockTicker } = body

    if (!eventId || !date) {
      return NextResponse.json(
        { success: false, error: 'Missing eventId or date' },
        { status: 400 }
      )
    }

    // Validate date format
    try {
      format(new Date(date), 'yyyy-MM-dd')
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Check if placement already exists for this user, event, date, and stock ticker
    const existingConditions = [
      eq(placements.userId, userId),
      eq(placements.eventId, eventId),
      eq(placements.date, date)
    ]

    if (stockTicker) {
      existingConditions.push(eq(placements.stockTicker, stockTicker))
    } else {
      existingConditions.push(sql`${placements.stockTicker} IS NULL`)
    }

    const existing = await db.select().from(placements).where(
      and(...existingConditions)
    ).limit(1)

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        data: existing[0],
        message: 'Placement already exists'
      })
    }

    const newPlacement = await db.insert(placements)
      .values({ userId, eventId, date, stockTicker: stockTicker || null })
      .returning()

    return NextResponse.json({
      success: true,
      data: newPlacement[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Placement creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create placement' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const placementId = searchParams.get('id')
    const eventId = searchParams.get('eventId')
    const date = searchParams.get('date')
    const stockTicker = searchParams.get('stockTicker')

    let deleted

    if (placementId) {
      // Delete by placement ID
      deleted = await db.delete(placements)
        .where(
          and(
            eq(placements.id, placementId),
            eq(placements.userId, userId)
          )
        )
        .returning()
    } else if (eventId && date) {
      // Delete by eventId, date, and optional stockTicker
      const deleteConditions = [
        eq(placements.userId, userId),
        eq(placements.eventId, eventId),
        eq(placements.date, date)
      ]

      if (stockTicker) {
        deleteConditions.push(eq(placements.stockTicker, stockTicker))
      } else {
        deleteConditions.push(sql`${placements.stockTicker} IS NULL`)
      }

      deleted = await db.delete(placements)
        .where(and(...deleteConditions))
        .returning()
    } else {
      return NextResponse.json(
        { success: false, error: 'Must provide placementId or eventId+date' },
        { status: 400 }
      )
    }

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Placement not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deleted[0]
    })
  } catch (error) {
    console.error('Placement deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete placement' },
      { status: 500 }
    )
  }
}
