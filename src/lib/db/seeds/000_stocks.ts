import * as dotenv from 'dotenv'

// Load environment variables BEFORE importing db
dotenv.config({ path: '.env.local' })

import { db, migrationClient } from '../index'
import { stocks } from '../schema'

interface SeedStock {
  ticker: string
  name: string
  type: 'stock' | 'crypto' | 'etf' | 'index'
  sector: string
}

async function seedStocks() {
  console.log('🌱 Seeding stocks table...')

  try {
    // Clear existing stocks (optional)
    await db.delete(stocks)
    console.log('✓ Cleared existing stocks')

    const defaultStocks: SeedStock[] = [
      // ============ MEGA-CAP TECHNOLOGY ============
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'MSFT',
        name: 'Microsoft Corporation',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'GOOGL',
        name: 'Alphabet Inc. (Class A)',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'GOOG',
        name: 'Alphabet Inc. (Class C)',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'AMZN',
        name: 'Amazon.com Inc.',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'NVDA',
        name: 'NVIDIA Corporation',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'META',
        name: 'Meta Platforms Inc.',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'TSLA',
        name: 'Tesla Inc.',
        type: 'stock',
        sector: 'Automotive'
      },

      // ============ FINANCIALS ============
      {
        ticker: 'BRK.B',
        name: 'Berkshire Hathaway Inc. (Class B)',
        type: 'stock',
        sector: 'Financial'
      },
      {
        ticker: 'JPM',
        name: 'JPMorgan Chase & Co.',
        type: 'stock',
        sector: 'Financial'
      },
      {
        ticker: 'V',
        name: 'Visa Inc.',
        type: 'stock',
        sector: 'Financial'
      },
      {
        ticker: 'MA',
        name: 'Mastercard Incorporated',
        type: 'stock',
        sector: 'Financial'
      },
      {
        ticker: 'BAC',
        name: 'Bank of America Corporation',
        type: 'stock',
        sector: 'Financial'
      },
      {
        ticker: 'HOOD',
        name: 'Robinhood Markets Inc.',
        type: 'stock',
        sector: 'Financial'
      },

      // ============ ADDITIONAL TECH ============
      {
        ticker: 'NFLX',
        name: 'Netflix Inc.',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'AMD',
        name: 'Advanced Micro Devices Inc.',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'CRM',
        name: 'Salesforce Inc.',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'ORCL',
        name: 'Oracle Corporation',
        type: 'stock',
        sector: 'Technology'
      },
      {
        ticker: 'ADBE',
        name: 'Adobe Inc.',
        type: 'stock',
        sector: 'Technology'
      },

      // ============ HEALTHCARE & CONSUMER ============
      {
        ticker: 'JNJ',
        name: 'Johnson & Johnson',
        type: 'stock',
        sector: 'Healthcare'
      },
      {
        ticker: 'PG',
        name: 'Procter & Gamble Co.',
        type: 'stock',
        sector: 'Consumer Goods'
      },
      {
        ticker: 'KO',
        name: 'The Coca-Cola Company',
        type: 'stock',
        sector: 'Consumer Goods'
      },
      {
        ticker: 'PFE',
        name: 'Pfizer Inc.',
        type: 'stock',
        sector: 'Healthcare'
      },

      // ============ ENERGY ============
      {
        ticker: 'XOM',
        name: 'Exxon Mobil Corporation',
        type: 'stock',
        sector: 'Energy'
      },
      {
        ticker: 'CVX',
        name: 'Chevron Corporation',
        type: 'stock',
        sector: 'Energy'
      },

      // ============ CRYPTOCURRENCY ============
      {
        ticker: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        sector: 'Cryptocurrency'
      },
      {
        ticker: 'ETH',
        name: 'Ethereum',
        type: 'crypto',
        sector: 'Cryptocurrency'
      },

      // ============ ETFs & INDEXES ============
      {
        ticker: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        type: 'etf',
        sector: 'Index Fund'
      },
      {
        ticker: 'QQQ',
        name: 'Invesco QQQ Trust',
        type: 'etf',
        sector: 'Index Fund'
      },
      {
        ticker: 'XLE',
        name: 'Energy Select Sector SPDR Fund',
        type: 'etf',
        sector: 'Sector Fund'
      },
    ]

    // Insert all stocks
    const inserted = await db.insert(stocks).values(defaultStocks).returning()

    console.log(`✅ Inserted ${inserted.length} stocks:`)
    console.log('\n📊 By Type:')
    const byType = inserted.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`)
    })

    console.log('\n🏢 By Sector:')
    const bySector = inserted.reduce((acc, s) => {
      acc[s.sector] = (acc[s.sector] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    Object.entries(bySector).forEach(([sector, count]) => {
      console.log(`  - ${sector}: ${count}`)
    })

    console.log('\n📋 Stock List:')
    inserted.forEach(stock => {
      console.log(`  ${stock.ticker.padEnd(8)} - ${stock.name} (${stock.type})`)
    })

    console.log('\n🎉 Stocks seeded successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await migrationClient.end()
    process.exit(0)
  }
}

seedStocks()
