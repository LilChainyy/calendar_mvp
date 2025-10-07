import * as dotenv from 'dotenv'

// Load environment variables BEFORE importing db
dotenv.config({ path: '.env.local' })

import { db, migrationClient } from '../index'
import { sql } from 'drizzle-orm'

async function createUserPreferencesTable() {
  console.log('🌱 Creating user_preferences table...')

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_preferences" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" text NOT NULL,
        "sectors" text[] DEFAULT '{}' NOT NULL,
        "investment_timeline" text NOT NULL,
        "check_frequency" text NOT NULL,
        "risk_tolerance" text NOT NULL,
        "portfolio_strategy" text NOT NULL,
        "completed_at" timestamp with time zone NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `)

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "user_id_idx" ON "user_preferences" USING btree ("user_id");
    `)

    console.log('✅ user_preferences table created successfully!')
  } catch (error) {
    console.error('❌ Table creation failed:', error)
    throw error
  } finally {
    await migrationClient.end()
    process.exit(0)
  }
}

createUserPreferencesTable()
