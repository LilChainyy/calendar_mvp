import { NextRequest, NextResponse } from 'next/server'
import { BrokerName } from '@/lib/types'

/**
 * POST /api/portfolio/connect
 *
 * Initiates OAuth connection flow for a brokerage account.
 * For MVP: Returns mock OAuth URL. In production, this would initiate real OAuth flow.
 *
 * Request body:
 * {
 *   broker: 'robinhood' | 'td_ameritrade' | 'etrade'
 * }
 *
 * Response:
 * {
 *   success: true,
 *   authorization_url: string,
 *   state: string // OAuth state parameter for CSRF protection
 * }
 */

const BROKER_CONFIG: Record<Exclude<BrokerName, 'manual'>, { name: string; authUrl: string; scopes: string[] }> = {
  robinhood: {
    name: 'Robinhood',
    authUrl: 'https://robinhood.com/oauth2/authorize',
    scopes: ['read_portfolio', 'read_positions']
  },
  td_ameritrade: {
    name: 'TD Ameritrade',
    authUrl: 'https://auth.tdameritrade.com/auth',
    scopes: ['PlaceTrades', 'AccountAccess', 'MoveMoney']
  },
  etrade: {
    name: 'E*TRADE',
    authUrl: 'https://us.etrade.com/e/t/etws/authorize',
    scopes: ['read_account', 'read_portfolio']
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { broker } = body as { broker: BrokerName }
    const userId = request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found. Please complete onboarding first.' },
        { status: 401 }
      )
    }

    if (!broker) {
      return NextResponse.json(
        { success: false, error: 'Broker name is required' },
        { status: 400 }
      )
    }

    if (broker === 'manual') {
      return NextResponse.json(
        { success: false, error: 'Use /api/portfolio/manual endpoint for manual portfolio entry' },
        { status: 400 }
      )
    }

    const validBrokers: BrokerName[] = ['robinhood', 'td_ameritrade', 'etrade']
    if (!validBrokers.includes(broker)) {
      return NextResponse.json(
        { success: false, error: `Invalid broker. Must be one of: ${validBrokers.join(', ')}` },
        { status: 400 }
      )
    }

    const brokerConfig = BROKER_CONFIG[broker]

    // TODO: Replace with real OAuth implementation
    // In production, you would:
    // 1. Generate a secure random state parameter
    // 2. Store state in session/database with user_id and expiration
    // 3. Build actual OAuth URL with client_id, redirect_uri, scope, state
    // 4. Return the authorization URL for redirect

    // Mock OAuth state (in production, this should be cryptographically secure)
    const state = `mock_state_${userId}_${broker}_${Date.now()}`

    // Mock authorization URL
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/portfolio/callback`
    const mockAuthUrl = `${brokerConfig.authUrl}?client_id=MOCK_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${brokerConfig.scopes.join(',')}&state=${state}&response_type=code`

    // In production, store the state in database/session for validation
    // await storeOAuthState(userId, state, broker)

    return NextResponse.json({
      success: true,
      authorization_url: mockAuthUrl,
      state,
      broker: broker,
      broker_name: brokerConfig.name,
      // For MVP testing: include mock callback URL
      mock_callback_url: `${redirectUri}?code=MOCK_AUTH_CODE&state=${state}`
    })
  } catch (error) {
    console.error('Portfolio connect error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initiate broker connection' },
      { status: 500 }
    )
  }
}
