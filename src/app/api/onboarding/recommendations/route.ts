import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stocks } from '@/lib/db/schema'
import { generateRecommendations } from '@/lib/recommendation-engine'
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

    // Fetch all stocks from database
    const allStocks = await db.select().from(stocks)

    // Generate recommendations
    const recommendations = generateRecommendations(body, allStocks)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
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
    const userPrefs = await db.query.userPreferences.findFirst({
      where: (prefs, { eq }) => eq(prefs.userId, userId),
      orderBy: (prefs, { desc }) => [desc(prefs.createdAt)],
    })

    if (!userPrefs) {
      return NextResponse.json(
        { error: 'No preferences found. Please complete onboarding first.' },
        { status: 404 }
      )
    }

    // Fetch all stocks from database
    const allStocks = await db.select().from(stocks)

    // Generate recommendations based on saved preferences
    const preferences: QuestionnaireData = {
      sectors: userPrefs.sectors,
      investmentTimeline: userPrefs.investmentTimeline,
      checkFrequency: userPrefs.checkFrequency,
      riskTolerance: userPrefs.riskTolerance,
      portfolioStrategy: userPrefs.portfolioStrategy,
    }

    const recommendations = generateRecommendations(preferences, allStocks)

    return NextResponse.json({ recommendations, preferences })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
