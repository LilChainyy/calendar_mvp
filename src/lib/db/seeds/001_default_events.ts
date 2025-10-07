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

      // ============ COMPREHENSIVE FEDERAL RESERVE & ECONOMIC DATA (OCT 2025 - JUN 2026) ============

      // OCTOBER 2025
      {
        title: 'CPI Report - September',
        description: 'Consumer Price Index for September 2025. Key inflation gauge tracked by Federal Reserve.',
        eventDate: new Date('2025-10-10T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PPI Report - September',
        description: 'Producer Price Index for September 2025. Measures wholesale inflation.',
        eventDate: new Date('2025-10-11T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Beige Book Release',
        description: 'Federal Reserve Beige Book summary of economic conditions ahead of October FOMC meeting.',
        eventDate: new Date('2025-10-15T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces October rate decision.',
        eventDate: new Date('2025-10-29T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'GDP Q3 2025 Advance Estimate',
        description: 'First estimate of Q3 2025 GDP growth rate. Key measure of economic health.',
        eventDate: new Date('2025-10-30T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PCE Report - September',
        description: 'Personal Consumption Expenditures for September 2025. Fed\'s preferred inflation gauge.',
        eventDate: new Date('2025-10-31T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // NOVEMBER 2025
      {
        title: 'Jobs Report - October',
        description: 'Non-farm payrolls and unemployment rate for October 2025.',
        eventDate: new Date('2025-11-07T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PPI Report - October',
        description: 'Producer Price Index for October 2025. Measures wholesale inflation.',
        eventDate: new Date('2025-11-14T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Minutes Release',
        description: 'Minutes from October 28-29 FOMC meeting. Details policy discussions and economic outlook.',
        eventDate: new Date('2025-11-19T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Beige Book Release',
        description: 'Federal Reserve Beige Book summary of economic conditions ahead of December FOMC meeting.',
        eventDate: new Date('2025-11-26T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'GDP Q3 2025 Second Estimate',
        description: 'Second estimate of Q3 2025 GDP growth rate with revised data.',
        eventDate: new Date('2025-11-26T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PCE Report - October',
        description: 'Personal Consumption Expenditures for October 2025. Fed\'s preferred inflation gauge.',
        eventDate: new Date('2025-11-26T10:00:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Minutes Release',
        description: 'Minutes from November 6-7 FOMC meeting. Details policy discussions and economic outlook.',
        eventDate: new Date('2025-11-26T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // DECEMBER 2025
      {
        title: 'Jobs Report - November',
        description: 'Non-farm payrolls and unemployment rate for November 2025.',
        eventDate: new Date('2025-12-05T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'CPI Report - November',
        description: 'Consumer Price Index for November 2025. Key inflation gauge tracked by Federal Reserve.',
        eventDate: new Date('2025-12-10T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PPI Report - November',
        description: 'Producer Price Index for November 2025. Measures wholesale inflation.',
        eventDate: new Date('2025-12-12T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Retail Sales - November',
        description: 'US retail sales data for November 2025. Critical holiday shopping indicator.',
        eventDate: new Date('2025-12-16T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces December rate decision with updated economic projections and dot plot.',
        eventDate: new Date('2025-12-18T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'GDP Q3 2025 Final Estimate',
        description: 'Final estimate of Q3 2025 GDP growth rate.',
        eventDate: new Date('2025-12-19T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PCE Report - November',
        description: 'Personal Consumption Expenditures for November 2025. Fed\'s preferred inflation gauge.',
        eventDate: new Date('2025-12-19T10:00:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // JANUARY 2026
      {
        title: 'FOMC Minutes Release',
        description: 'Minutes from December 17-18 FOMC meeting. Details policy discussions and 2026 outlook.',
        eventDate: new Date('2026-01-08T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Jobs Report - December',
        description: 'Non-farm payrolls and unemployment rate for December 2025.',
        eventDate: new Date('2026-01-09T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'CPI Report - December',
        description: 'Consumer Price Index for December 2025. Key inflation gauge tracked by Federal Reserve.',
        eventDate: new Date('2026-01-14T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Beige Book Release',
        description: 'Federal Reserve Beige Book summary of economic conditions ahead of January FOMC meeting.',
        eventDate: new Date('2026-01-14T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PPI Report - December',
        description: 'Producer Price Index for December 2025. Measures wholesale inflation.',
        eventDate: new Date('2026-01-15T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Retail Sales - December',
        description: 'US retail sales data for December 2025. Final holiday shopping report.',
        eventDate: new Date('2026-01-16T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces January 2026 rate decision. First meeting of the year.',
        eventDate: new Date('2026-01-28T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'GDP Q4 2025 Advance Estimate',
        description: 'First estimate of Q4 2025 GDP growth rate.',
        eventDate: new Date('2026-01-29T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PCE Report - December',
        description: 'Personal Consumption Expenditures for December 2025. Fed\'s preferred inflation gauge.',
        eventDate: new Date('2026-01-30T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // FEBRUARY 2026
      {
        title: 'Jobs Report - January',
        description: 'Non-farm payrolls and unemployment rate for January 2026.',
        eventDate: new Date('2026-02-06T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'CPI Report - January',
        description: 'Consumer Price Index for January 2026. Key inflation gauge tracked by Federal Reserve.',
        eventDate: new Date('2026-02-13T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PPI Report - January',
        description: 'Producer Price Index for January 2026. Measures wholesale inflation.',
        eventDate: new Date('2026-02-14T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Retail Sales - January',
        description: 'US retail sales data for January 2026. Post-holiday consumer spending indicator.',
        eventDate: new Date('2026-02-17T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Minutes Release',
        description: 'Minutes from January 27-28 FOMC meeting. Details policy discussions and economic outlook.',
        eventDate: new Date('2026-02-18T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'GDP Q4 2025 Second Estimate',
        description: 'Second estimate of Q4 2025 GDP growth rate with revised data.',
        eventDate: new Date('2026-02-26T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PCE Report - January',
        description: 'Personal Consumption Expenditures for January 2026. Fed\'s preferred inflation gauge.',
        eventDate: new Date('2026-02-27T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // MARCH 2026
      {
        title: 'Beige Book Release',
        description: 'Federal Reserve Beige Book summary of economic conditions ahead of March FOMC meeting.',
        eventDate: new Date('2026-03-04T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Jobs Report - February',
        description: 'Non-farm payrolls and unemployment rate for February 2026.',
        eventDate: new Date('2026-03-06T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'CPI Report - February',
        description: 'Consumer Price Index for February 2026. Key inflation gauge tracked by Federal Reserve.',
        eventDate: new Date('2026-03-11T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PPI Report - February',
        description: 'Producer Price Index for February 2026. Measures wholesale inflation.',
        eventDate: new Date('2026-03-13T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Retail Sales - February',
        description: 'US retail sales data for February 2026. Consumer spending indicator.',
        eventDate: new Date('2026-03-16T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces March 2026 rate decision.',
        eventDate: new Date('2026-03-18T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'GDP Q4 2025 Final Estimate',
        description: 'Final estimate of Q4 2025 GDP growth rate.',
        eventDate: new Date('2026-03-26T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PCE Report - February',
        description: 'Personal Consumption Expenditures for February 2026. Fed\'s preferred inflation gauge.',
        eventDate: new Date('2026-03-27T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // APRIL 2026
      {
        title: 'Jobs Report - March',
        description: 'Non-farm payrolls and unemployment rate for March 2026.',
        eventDate: new Date('2026-04-03T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Minutes Release',
        description: 'Minutes from March 17-18 FOMC meeting. Details policy discussions and economic outlook.',
        eventDate: new Date('2026-04-08T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'CPI Report - March',
        description: 'Consumer Price Index for March 2026. Key inflation gauge tracked by Federal Reserve.',
        eventDate: new Date('2026-04-10T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PPI Report - March',
        description: 'Producer Price Index for March 2026. Measures wholesale inflation.',
        eventDate: new Date('2026-04-14T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Beige Book Release',
        description: 'Federal Reserve Beige Book summary of economic conditions ahead of April FOMC meeting.',
        eventDate: new Date('2026-04-15T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Retail Sales - March',
        description: 'US retail sales data for March 2026. Consumer spending indicator.',
        eventDate: new Date('2026-04-15T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces April 2026 rate decision.',
        eventDate: new Date('2026-04-29T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'GDP Q1 2026 Advance Estimate',
        description: 'First estimate of Q1 2026 GDP growth rate.',
        eventDate: new Date('2026-04-29T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PCE Report - March',
        description: 'Personal Consumption Expenditures for March 2026. Fed\'s preferred inflation gauge.',
        eventDate: new Date('2026-04-30T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // MAY 2026
      {
        title: 'Jobs Report - April',
        description: 'Non-farm payrolls and unemployment rate for April 2026.',
        eventDate: new Date('2026-05-08T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'CPI Report - April',
        description: 'Consumer Price Index for April 2026. Key inflation gauge tracked by Federal Reserve.',
        eventDate: new Date('2026-05-12T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PPI Report - April',
        description: 'Producer Price Index for April 2026. Measures wholesale inflation.',
        eventDate: new Date('2026-05-14T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Retail Sales - April',
        description: 'US retail sales data for April 2026. Consumer spending indicator.',
        eventDate: new Date('2026-05-15T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Minutes Release',
        description: 'Minutes from April 28-29 FOMC meeting. Details policy discussions and economic outlook.',
        eventDate: new Date('2026-05-20T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'GDP Q1 2026 Second Estimate',
        description: 'Second estimate of Q1 2026 GDP growth rate with revised data.',
        eventDate: new Date('2026-05-28T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PCE Report - April',
        description: 'Personal Consumption Expenditures for April 2026. Fed\'s preferred inflation gauge.',
        eventDate: new Date('2026-05-29T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },

      // JUNE 2026
      {
        title: 'Beige Book Release',
        description: 'Federal Reserve Beige Book summary of economic conditions ahead of June FOMC meeting.',
        eventDate: new Date('2026-06-03T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Jobs Report - May',
        description: 'Non-farm payrolls and unemployment rate for May 2026.',
        eventDate: new Date('2026-06-05T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'CPI Report - May',
        description: 'Consumer Price Index for May 2026. Key inflation gauge tracked by Federal Reserve.',
        eventDate: new Date('2026-06-10T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PPI Report - May',
        description: 'Producer Price Index for May 2026. Measures wholesale inflation.',
        eventDate: new Date('2026-06-12T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'Retail Sales - May',
        description: 'US retail sales data for May 2026. Consumer spending indicator.',
        eventDate: new Date('2026-06-16T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'FOMC Interest Rate Decision',
        description: 'Federal Open Market Committee announces June 2026 rate decision with updated economic projections.',
        eventDate: new Date('2026-06-17T14:00:00'),
        category: 'fed_policy',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'GDP Q1 2026 Final Estimate',
        description: 'Final estimate of Q1 2026 GDP growth rate.',
        eventDate: new Date('2026-06-25T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
      {
        title: 'PCE Report - May',
        description: 'Personal Consumption Expenditures for May 2026. Fed\'s preferred inflation gauge.',
        eventDate: new Date('2026-06-26T08:30:00'),
        category: 'economic_data',
        impactScope: 'market',
        affectedTickers: [],
        isFixedDate: 'true'
      },
    ]

    // Insert events in batches to avoid parameter limit
    const batchSize = 20
    const inserted = []

    for (let i = 0; i < defaultEvents.length; i += batchSize) {
      const batch = defaultEvents.slice(i, i + batchSize)
      const batchResult = await db.insert(events).values(batch).returning()
      inserted.push(...batchResult)
      console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1} (${batchResult.length} events)`)
    }

    console.log(`✅ Inserted ${inserted.length} default events total:`)
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
