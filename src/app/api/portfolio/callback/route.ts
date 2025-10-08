import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userPortfolios } from '@/lib/db/schema'
import { encryptToken } from '@/lib/crypto'
import { eq, and } from 'drizzle-orm'
import { BrokerName } from '@/lib/types'

/**
 * GET /api/portfolio/callback
 *
 * OAuth callback handler for broker connections.
 * For MVP: Accepts mock OAuth code and creates portfolio connection.
 * In production: Exchanges auth code for access/refresh tokens.
 *
 * Query parameters:
 * - code: OAuth authorization code
 * - state: OAuth state parameter (for CSRF protection)
 *
 * Redirects to: /portfolio/success or /portfolio/error
 */

interface BrokerTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

/**
 * Mock function to exchange OAuth code for tokens
 * TODO: Replace with actual broker API calls
 */
async function exchangeCodeForTokens(
  broker: BrokerName,
  code: string
): Promise<BrokerTokenResponse> {
  // In production, this would make actual API calls to broker's token endpoint
  // Example for TD Ameritrade:
  // const response = await fetch('https://api.tdameritrade.com/v1/oauth2/token', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: new URLSearchParams({
  //     grant_type: 'authorization_code',
  //     code,
  //     client_id: process.env.TD_AMERITRADE_CLIENT_ID,
  //     redirect_uri: process.env.TD_AMERITRADE_REDIRECT_URI,
  //   })
  // })

  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock tokens
  return {
    access_token: `mock_access_token_${broker}_${Date.now()}`,
    refresh_token: `mock_refresh_token_${broker}_${Date.now()}`,
    expires_in: 3600, // 1 hour
    token_type: 'Bearer'
  }
}

/**
 * Extract broker name from OAuth state parameter
 * In production, you would validate the state against stored values
 */
function extractBrokerFromState(state: string): BrokerName | null {
  // Mock state format: mock_state_{userId}_{broker}_{timestamp}
  const parts = state.split('_')
  if (parts.length >= 4) {
    const broker = parts[3] as BrokerName
    if (['robinhood', 'td_ameritrade', 'etrade'].includes(broker)) {
      return broker
    }
  }
  return null
}

/**
 * Extract user ID from OAuth state parameter
 */
function extractUserIdFromState(state: string): string | null {
  // Mock state format: mock_state_{userId}_{broker}_{timestamp}
  const parts = state.split('_')
  if (parts.length >= 4) {
    return parts[2]
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth error (user denied access)
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Authorization denied'
      console.error('OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/portfolio/error?message=${encodeURIComponent(errorDescription)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/portfolio/error?message=Missing authorization code or state', request.url)
      )
    }

    // TODO: In production, validate state parameter against stored values to prevent CSRF
    // const isValidState = await validateOAuthState(state)
    // if (!isValidState) {
    //   return NextResponse.redirect(new URL('/portfolio/error?message=Invalid state parameter', request.url))
    // }

    const broker = extractBrokerFromState(state)
    const userId = extractUserIdFromState(state)

    if (!broker || !userId) {
      return NextResponse.redirect(
        new URL('/portfolio/error?message=Invalid OAuth state', request.url)
      )
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(broker, code)

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(tokens.access_token)
    const encryptedRefreshToken = encryptToken(tokens.refresh_token)

    // Calculate token expiration time
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Check if user already has a portfolio for this broker
    const existingPortfolio = await db
      .select()
      .from(userPortfolios)
      .where(
        and(
          eq(userPortfolios.userId, userId),
          eq(userPortfolios.brokerName, broker)
        )
      )
      .limit(1)

    if (existingPortfolio.length > 0) {
      // Update existing portfolio
      await db
        .update(userPortfolios)
        .set({
          accessTokenEncrypted: encryptedAccessToken,
          refreshTokenEncrypted: encryptedRefreshToken,
          tokenExpiresAt,
          connectionStatus: 'connected',
          updatedAt: new Date()
        })
        .where(eq(userPortfolios.id, existingPortfolio[0].id))
    } else {
      // Create new portfolio
      await db.insert(userPortfolios).values({
        userId,
        brokerName: broker,
        accessTokenEncrypted: encryptedAccessToken,
        refreshTokenEncrypted: encryptedRefreshToken,
        tokenExpiresAt,
        connectionStatus: 'connected'
      })
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/portfolio/success?broker=${broker}`, request.url)
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/portfolio/error?message=Failed to complete authorization', request.url)
    )
  }
}
