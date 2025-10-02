import * as dotenv from 'dotenv'

// Load environment variables BEFORE importing db
dotenv.config({ path: '.env.local' })

import { db, migrationClient } from './index'
import { events } from './schema'
import seedData from '@/data/seed-events.json'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Transform seed data to match schema
    const eventsToInsert = seedData.map(event => ({
      title: event.title,
      description: event.description,
      eventDate: new Date(event.event_date),
      category: event.category,
      impactScope: event.impact_scope,
      primaryTicker: event.primary_ticker || null,
      affectedTickers: event.affected_tickers,
    }))

    // Insert events
    const insertedEvents = await db.insert(events).values(eventsToInsert).returning()

    console.log(`✅ Inserted ${insertedEvents.length} events`)
    console.log('Events:', insertedEvents.map(e => e.title))

    console.log('🎉 Seeding complete!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await migrationClient.end()
    process.exit(0)
  }
}

seed()
