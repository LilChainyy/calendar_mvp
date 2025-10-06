import * as dotenv from 'dotenv'

// Load environment variables BEFORE importing db
dotenv.config({ path: '.env.local' })

import { db, migrationClient } from '../index'
import { events } from '../schema'

interface SeedEvent {
  title: string
  description: string
  eventDate: Date
  category: string
  impactScope: string
  primaryTicker?: string
  affectedTickers: string[]
  isFixedDate?: string
}

async function seedDefaultEvents() {
  console.log('🌱 Seeding default events...')

  try {
    // Clear existing events (optional - remove if you want to keep existing)
    await db.delete(events)
    console.log('✓ Cleared existing events')

    const defaultEvents: SeedEvent[] = [
      // ============ FEDERAL RESERVE MEETINGS (Next 12 months) ============
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces interest rate decision for November 2025. Market expects data-dependent approach with focus on inflation trends.',
        eventDate: new Date('2025-11-07T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces final interest rate decision of 2025. Typically includes updated economic projections and dot plot.',
        eventDate: new Date('2025-12-18T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces first interest rate decision of 2026. Key indicator for monetary policy direction.',
        eventDate: new Date('2026-01-29T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // ============ MAJOR ECONOMIC DATA RELEASES (Next 3 months) ============
      {
        title: 'CPI Inflation Report - October',
        description: 'Consumer Price Index for October 2025. Key inflation indicator watched by Fed for rate decisions. Consensus: 2.4% YoY.',
        eventDate: new Date('2025-11-13T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PCE Inflation Report - October',
        description: 'Personal Consumption Expenditures index - the Fed\'s preferred inflation gauge. Expected: 2.3% YoY core PCE.',
        eventDate: new Date('2025-11-27T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Jobs Report - November',
        description: 'Non-farm payrolls and unemployment rate for November 2025. Consensus: 180K jobs added, 4.0% unemployment.',
        eventDate: new Date('2025-12-06T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // ============ TOP 10 TECH STOCK EARNINGS (Q4 2025) ============
      {
        title: 'Apple Q4 2025 Earnings',
        description: 'Apple Inc. reports fiscal Q4 2025 earnings. Analysts expect iPhone 16 strength and Services growth. EPS est: $1.54.',
        eventDate: new Date('2025-10-31T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'AAPL',
        affectedTickers: ['AAPL'],
        isFixedDate: 'true'
      },
      {
        title: 'Microsoft Q1 FY2026 Earnings',
        description: 'Microsoft reports fiscal Q1 2026 earnings. Focus on Azure cloud growth and AI integration. EPS est: $3.10.',
        eventDate: new Date('2025-10-29T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'MSFT',
        affectedTickers: ['MSFT'],
        isFixedDate: 'true'
      },
      {
        title: 'Meta Q3 2025 Earnings',
        description: 'Meta Platforms Q3 earnings call. Key metrics: DAU growth, Reality Labs losses, ad revenue trends. EPS est: $5.25.',
        eventDate: new Date('2025-10-30T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'META',
        affectedTickers: ['META'],
        isFixedDate: 'true'
      },
      {
        title: 'Amazon Q3 2025 Earnings',
        description: 'Amazon Q3 results. Focus on AWS growth, retail margins, and Prime subscriber trends. EPS est: $1.14.',
        eventDate: new Date('2025-10-31T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'AMZN',
        affectedTickers: ['AMZN'],
        isFixedDate: 'true'
      },
      {
        title: 'NVIDIA Q3 FY2026 Earnings',
        description: 'NVIDIA fiscal Q3 2026 earnings. AI chip demand, data center revenue, and guidance in focus. EPS est: $0.74.',
        eventDate: new Date('2025-11-20T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'NVDA',
        affectedTickers: ['NVDA'],
        isFixedDate: 'true'
      },
      {
        title: 'Alphabet Q3 2025 Earnings',
        description: 'Google parent Alphabet reports Q3 results. YouTube ad revenue, Cloud growth, and AI investments key. EPS est: $1.83.',
        eventDate: new Date('2025-11-05T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'GOOGL',
        affectedTickers: ['GOOGL', 'GOOG'],
        isFixedDate: 'true'
      },
      {
        title: 'Tesla Q3 2025 Earnings',
        description: 'Tesla Q3 earnings and production update. Vehicle delivery guidance, Cybertruck ramp, and margin trends. EPS est: $0.58.',
        eventDate: new Date('2025-10-23T17:30:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'TSLA',
        affectedTickers: ['TSLA'],
        isFixedDate: 'true'
      },

      // ============ ADDITIONAL NOTABLE EVENTS ============
      {
        title: 'Retail Sales Report - October',
        description: 'US retail sales data for October 2025. Key consumer spending indicator ahead of holiday season.',
        eventDate: new Date('2025-11-16T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'GDP Q3 2025 Final Estimate',
        description: 'Third and final estimate of Q3 2025 GDP growth. Consensus: 2.8% annualized growth.',
        eventDate: new Date('2025-11-21T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Consumer Confidence Index',
        description: 'November Consumer Confidence reading from Conference Board. Forward-looking economic indicator.',
        eventDate: new Date('2025-11-26T10:00:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // ============ ROBINHOOD (HOOD) SPECIFIC EVENTS ============
      {
        title: 'Robinhood Q3 2025 Earnings',
        description: 'Robinhood Markets reports Q3 2025 earnings. Focus on trading volume, crypto revenue growth, and monthly active users. EPS est: $0.18.',
        eventDate: new Date('2025-10-30T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'HOOD',
        affectedTickers: ['HOOD'],
        isFixedDate: 'true'
      },
      {
        title: 'SEC Crypto Regulation Announcement',
        description: 'SEC expected to announce new cryptocurrency trading regulations affecting retail brokerages like Robinhood and Coinbase.',
        eventDate: new Date('2025-11-12T10:00:00'),
        category: 'regulatory',
        impactScope: 'sector',
        primaryTicker: 'HOOD',
        affectedTickers: ['HOOD', 'COIN'],
        isFixedDate: 'false'
      },
      {
        title: 'Robinhood Options Trading Expansion',
        description: 'Robinhood announces expansion of options trading features and new derivative products to compete with traditional brokerages.',
        eventDate: new Date('2025-11-05T09:00:00'),
        category: 'corporate_action',
        impactScope: 'single_stock',
        primaryTicker: 'HOOD',
        affectedTickers: ['HOOD'],
        isFixedDate: 'false'
      },
      {
        title: 'Fintech Innovation Summit',
        description: 'Annual fintech conference where Robinhood CEO expected to speak on retail trading trends and industry disruption.',
        eventDate: new Date('2025-11-22T09:00:00'),
        category: 'corporate_action',
        impactScope: 'sector',
        primaryTicker: 'HOOD',
        affectedTickers: ['HOOD', 'SQ', 'PYPL'],
        isFixedDate: 'true'
      },
      {
        title: 'Robinhood User Growth Report',
        description: 'Robinhood scheduled to release Q3 monthly active user (MAU) statistics, account funding data, and assets under custody metrics.',
        eventDate: new Date('2025-10-25T12:00:00'),
        category: 'corporate_action',
        impactScope: 'single_stock',
        primaryTicker: 'HOOD',
        affectedTickers: ['HOOD'],
        isFixedDate: 'true'
      },
    ]

    // Insert all events
    const inserted = await db.insert(events).values(defaultEvents).returning()

    console.log(`✅ Inserted ${inserted.length} default events:`)
    console.log('\n📅 Federal Reserve Meetings: 3')
    console.log('📊 Economic Data Releases: 6')
    console.log('💼 Tech Earnings Reports: 7')
    console.log('\nEvent List:')
    inserted.forEach(event => {
      const date = new Date(event.eventDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      console.log(`  - ${date}: ${event.title}`)
    })

    console.log('\n🎉 Default events seeded successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await migrationClient.end()
    process.exit(0)
  }
}

seedDefaultEvents()
