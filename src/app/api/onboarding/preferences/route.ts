import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userPreferences } from '@/lib/db/schema'
import { QuestionnaireData } from '@/components/OnboardingQuestionnaire'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QuestionnaireData

    // Validate required fields
    if (
      !body.sectors ||
      body.sectors.length === 0 ||
      !body.investmentTimeline ||
      !body.checkFrequency ||
      !body.riskTolerance ||
      !body.portfolioStrategy
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get or generate user ID (in production, use auth)
    // For now, use a simple localStorage-based ID pattern
    const userId = request.cookies.get('user_id')?.value || `user_${Date.now()}`

    // Insert preferences into database
    const preference = await db
      .insert(userPreferences)
      .values({
        userId,
        sectors: body.sectors,
        investmentTimeline: body.investmentTimeline,
        checkFrequency: body.checkFrequency,
        riskTolerance: body.riskTolerance,
        portfolioStrategy: body.portfolioStrategy,
        completedAt: new Date(),
      })
      .returning()

    // Set user_id cookie if not already set
    const response = NextResponse.json({ success: true, preference: preference[0] })
    if (!request.cookies.get('user_id')) {
      response.cookies.set('user_id', userId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'No user ID found' },
        { status: 404 }
      )
    }

    // Get user's latest preferences
    const preferences = await db.query.userPreferences.findFirst({
      where: (prefs, { eq }) => eq(prefs.userId, userId),
      orderBy: (prefs, { desc }) => [desc(prefs.createdAt)],
    })

    if (!preferences) {
      return NextResponse.json(
        { error: 'No preferences found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}
