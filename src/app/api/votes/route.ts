import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { votes } from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'

interface VoteAggregate {
  eventId: string
  yes: number
  no: number
  no_comment: number
  total: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, vote } = body
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 401 }
      )
    }

    if (!eventId || !vote) {
      return NextResponse.json(
        { success: false, error: 'Missing eventId or vote' },
        { status: 400 }
      )
    }

    if (!['yes', 'no', 'no_comment'].includes(vote)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote value' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const existingVote = await db.select().from(votes).where(
      and(
        eq(votes.userId, userId),
        eq(votes.eventId, eventId)
      )
    ).limit(1)

    let result

    if (existingVote.length > 0) {
      // Update existing vote
      result = await db.update(votes)
        .set({ vote, updatedAt: new Date() })
        .where(and(
          eq(votes.userId, userId),
          eq(votes.eventId, eventId)
        ))
        .returning()
    } else {
      // Insert new vote
      result = await db.insert(votes)
        .values({ userId, eventId, vote })
        .returning()
    }

    // Calculate aggregate
    const aggregate = await calculateAggregate(eventId)

    return NextResponse.json({
      success: true,
      data: {
        vote: result[0],
        aggregate
      }
    })
  } catch (error) {
    console.error('Vote submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 401 }
      )
    }

    if (eventId) {
      // Get aggregate for specific event
      const aggregate = await calculateAggregate(eventId)
      const userVote = await db.select().from(votes).where(
        and(
          eq(votes.userId, userId),
          eq(votes.eventId, eventId)
        )
      ).limit(1)

      return NextResponse.json({
        success: true,
        data: {
          aggregate,
          userVote: userVote[0]?.vote || null
        }
      })
    } else {
      // Get all user votes
      const userVotes = await db.select().from(votes).where(
        eq(votes.userId, userId)
      )

      return NextResponse.json({
        success: true,
        data: userVotes
      })
    }
  } catch (error) {
    console.error('Vote retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve votes' },
      { status: 500 }
    )
  }
}

async function calculateAggregate(eventId: string): Promise<VoteAggregate> {
  const eventVotes = await db.select().from(votes).where(
    eq(votes.eventId, eventId)
  )

  const aggregate: VoteAggregate = {
    eventId,
    yes: eventVotes.filter(v => v.vote === 'yes').length,
    no: eventVotes.filter(v => v.vote === 'no').length,
    no_comment: eventVotes.filter(v => v.vote === 'no_comment').length,
    total: eventVotes.length
  }

  return aggregate
}
