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
        affectedTickers: []
      },
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces final interest rate decision of 2025. Typically includes updated economic projections and dot plot.',
        eventDate: new Date('2025-12-18T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: []
      },
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces first interest rate decision of 2026. Key indicator for monetary policy direction.',
        eventDate: new Date('2026-01-29T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: []
      },

      // ============ MAJOR ECONOMIC DATA RELEASES (Next 3 months) ============
      {
        title: 'CPI Inflation Report - October',
        description: 'Consumer Price Index for October 2025. Key inflation indicator watched by Fed for rate decisions. Consensus: 2.4% YoY.',
        eventDate: new Date('2025-11-13T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: []
      },
      {
        title: 'PCE Inflation Report - October',
        description: 'Personal Consumption Expenditures index - the Fed\'s preferred inflation gauge. Expected: 2.3% YoY core PCE.',
        eventDate: new Date('2025-11-27T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: []
      },
      {
        title: 'Jobs Report - November',
        description: 'Non-farm payrolls and unemployment rate for November 2025. Consensus: 180K jobs added, 4.0% unemployment.',
        eventDate: new Date('2025-12-06T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: []
      },

      // ============ TOP 10 TECH STOCK EARNINGS (Q4 2025) ============
      {
        title: 'Apple Q4 2025 Earnings',
        description: 'Apple Inc. reports fiscal Q4 2025 earnings. Analysts expect iPhone 16 strength and Services growth. EPS est: $1.54.',
        eventDate: new Date('2025-10-31T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'AAPL',
        affectedTickers: ['AAPL']
      },
      {
        title: 'Microsoft Q1 FY2026 Earnings',
        description: 'Microsoft reports fiscal Q1 2026 earnings. Focus on Azure cloud growth and AI integration. EPS est: $3.10.',
        eventDate: new Date('2025-10-29T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'MSFT',
        affectedTickers: ['MSFT']
      },
      {
        title: 'Meta Q3 2025 Earnings',
        description: 'Meta Platforms Q3 earnings call. Key metrics: DAU growth, Reality Labs losses, ad revenue trends. EPS est: $5.25.',
        eventDate: new Date('2025-10-30T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'META',
        affectedTickers: ['META']
      },
      {
        title: 'Amazon Q3 2025 Earnings',
        description: 'Amazon Q3 results. Focus on AWS growth, retail margins, and Prime subscriber trends. EPS est: $1.14.',
        eventDate: new Date('2025-10-31T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'AMZN',
        affectedTickers: ['AMZN']
      },
      {
        title: 'NVIDIA Q3 FY2026 Earnings',
        description: 'NVIDIA fiscal Q3 2026 earnings. AI chip demand, data center revenue, and guidance in focus. EPS est: $0.74.',
        eventDate: new Date('2025-11-20T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'NVDA',
        affectedTickers: ['NVDA']
      },
      {
        title: 'Alphabet Q3 2025 Earnings',
        description: 'Google parent Alphabet reports Q3 results. YouTube ad revenue, Cloud growth, and AI investments key. EPS est: $1.83.',
        eventDate: new Date('2025-11-05T16:00:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'GOOGL',
        affectedTickers: ['GOOGL', 'GOOG']
      },
      {
        title: 'Tesla Q3 2025 Earnings',
        description: 'Tesla Q3 earnings and production update. Vehicle delivery guidance, Cybertruck ramp, and margin trends. EPS est: $0.58.',
        eventDate: new Date('2025-10-23T17:30:00'),
        category: 'earnings',
        impactScope: 'single_stock',
        primaryTicker: 'TSLA',
        affectedTickers: ['TSLA']
      },

      // ============ ADDITIONAL NOTABLE EVENTS ============
      {
        title: 'Retail Sales Report - October',
        description: 'US retail sales data for October 2025. Key consumer spending indicator ahead of holiday season.',
        eventDate: new Date('2025-11-16T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: []
      },
      {
        title: 'GDP Q3 2025 Final Estimate',
        description: 'Third and final estimate of Q3 2025 GDP growth. Consensus: 2.8% annualized growth.',
        eventDate: new Date('2025-11-21T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: []
      },
      {
        title: 'Consumer Confidence Index',
        description: 'November Consumer Confidence reading from Conference Board. Forward-looking economic indicator.',
        eventDate: new Date('2025-11-26T10:00:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: []
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
