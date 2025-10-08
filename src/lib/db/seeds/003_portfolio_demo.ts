import { db } from '@/lib/db'
import { userPortfolios, portfolioHoldings } from '@/lib/db/schema'
import { encryptToken } from '@/lib/crypto'

/**
 * Seed script for portfolio demo data
 *
 * This creates a demo user portfolio with sample holdings for testing purposes.
 * Run this script to populate the database with realistic portfolio data.
 *
 * Usage:
 * - Ensure PORTFOLIO_ENCRYPTION_KEY is set in .env.local
 * - Run: npx tsx src/lib/db/seeds/003_portfolio_demo.ts
 */

const DEMO_USER_ID = 'demo_user'

async function seedPortfolioData() {
  console.log('Starting portfolio demo data seed...')

  try {
    // Check if demo portfolio already exists
    const existingPortfolio = await db
      .select()
      .from(userPortfolios)
      .where((up) => up.userId === DEMO_USER_ID)
      .limit(1)

    if (existingPortfolio.length > 0) {
      console.log('Demo portfolio already exists. Skipping seed.')
      return
    }

    // Create mock access and refresh tokens
    const mockAccessToken = `demo_access_token_${Date.now()}`
    const mockRefreshToken = `demo_refresh_token_${Date.now()}`

    // Encrypt tokens
    const encryptedAccessToken = encryptToken(mockAccessToken)
    const encryptedRefreshToken = encryptToken(mockRefreshToken)

    // Create demo Robinhood portfolio
    console.log('Creating demo Robinhood portfolio...')
    const robinhoodPortfolio = await db
      .insert(userPortfolios)
      .values({
        userId: DEMO_USER_ID,
        brokerName: 'robinhood',
        accessTokenEncrypted: encryptedAccessToken,
        refreshTokenEncrypted: encryptedRefreshToken,
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
        connectionStatus: 'connected',
        lastSyncAt: new Date()
      })
      .returning()

    console.log(`Created Robinhood portfolio: ${robinhoodPortfolio[0].id}`)

    // Add holdings to Robinhood portfolio
    const robinhoodHoldings = [
      { ticker: 'AAPL', quantity: '10', costBasis: '150.00', currentValue: '1750.50' },
      { ticker: 'TSLA', quantity: '5', costBasis: '220.00', currentValue: '1100.25' },
      { ticker: 'NVDA', quantity: '8', costBasis: '450.00', currentValue: '3600.00' },
      { ticker: 'MSFT', quantity: '15', costBasis: '280.00', currentValue: '4200.75' },
      { ticker: 'GOOGL', quantity: '6', costBasis: '125.00', currentValue: '750.30' },
    ]

    console.log('Adding holdings to Robinhood portfolio...')
    await db.insert(portfolioHoldings).values(
      robinhoodHoldings.map((holding) => ({
        portfolioId: robinhoodPortfolio[0].id,
        ticker: holding.ticker,
        quantity: holding.quantity,
        costBasis: holding.costBasis,
        currentValue: holding.currentValue,
        lastUpdated: new Date()
      }))
    )

    console.log(`Added ${robinhoodHoldings.length} holdings to Robinhood portfolio`)

    // Create demo manual portfolio
    console.log('Creating demo manual portfolio...')
    const manualPortfolio = await db
      .insert(userPortfolios)
      .values({
        userId: DEMO_USER_ID,
        brokerName: 'manual',
        connectionStatus: 'connected'
      })
      .returning()

    console.log(`Created manual portfolio: ${manualPortfolio[0].id}`)

    // Add holdings to manual portfolio
    const manualHoldings = [
      { ticker: 'AMD', quantity: '1' },
      { ticker: 'INTC', quantity: '1' },
      { ticker: 'NFLX', quantity: '1' },
      { ticker: 'DIS', quantity: '1' },
      { ticker: 'META', quantity: '1' },
    ]

    console.log('Adding holdings to manual portfolio...')
    await db.insert(portfolioHoldings).values(
      manualHoldings.map((holding) => ({
        portfolioId: manualPortfolio[0].id,
        ticker: holding.ticker,
        quantity: holding.quantity,
        costBasis: null,
        currentValue: null,
        lastUpdated: new Date()
      }))
    )

    console.log(`Added ${manualHoldings.length} holdings to manual portfolio`)

    console.log('\nPortfolio demo data seed completed successfully!')
    console.log('\nSummary:')
    console.log(`- Demo User ID: ${DEMO_USER_ID}`)
    console.log(`- Robinhood Portfolio: ${robinhoodHoldings.length} holdings`)
    console.log(`- Manual Portfolio: ${manualHoldings.length} holdings`)
    console.log(`- Total Unique Tickers: ${new Set([...robinhoodHoldings.map(h => h.ticker), ...manualHoldings.map(h => h.ticker)]).size}`)

  } catch (error) {
    console.error('Error seeding portfolio data:', error)
    throw error
  }
}

// Run the seed function
if (require.main === module) {
  seedPortfolioData()
    .then(() => {
      console.log('\nSeed completed. Exiting...')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seed failed:', error)
      process.exit(1)
    })
}

export { seedPortfolioData }
