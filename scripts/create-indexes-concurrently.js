#!/usr/bin/env node
/*
 * PostgreSQL indekslerini kesintisiz oluşturma aracı
 * - CREATE INDEX CONCURRENTLY IF NOT EXISTS kullanır
 * - Sadece canlı/prod için önerilir; dev/staging'de Prisma migrate yeterlidir
 */

// Load .env if present
try { require('dotenv').config(); } catch (_) {}
const { Client } = require('pg');

function env(name, required = true) {
  const v = process.env[name];
  if (required && (!v || v.length === 0)) {
    console.error(`[ERROR] Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

function parseDatabaseUrl(url) {
  // PostgreSQL connection string; we delegate to 'pg' to parse
  return { connectionString: url };
}

async function run() {
  const databaseUrl = env('DATABASE_URL');
  const { connectionString } = parseDatabaseUrl(databaseUrl);

  const client = new Client({ connectionString });
  await client.connect();

  // NOTE: Prisma default schema is public; adjust if you use a custom schema
  const statements = [
    // User
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_status ON "User"("status");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_created_at ON "User"("createdAt");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_last_login_at ON "User"("lastLoginAt");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_reset_token ON "User"("resetToken", "resetTokenExpiry");`,

    // Reservation
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_res_user_type_created_at ON "Reservation"("userId", "type", "createdAt");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_res_user_created_at ON "Reservation"("userId", "createdAt");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_res_pnr ON "Reservation"("pnr");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_res_order_id ON "Reservation"("biletDukkaniOrderId");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_res_route_id ON "Reservation"("biletDukkaniRouteId");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_res_departure_time ON "Reservation"("departureTime");`,

    // Payment
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_user ON "Payment"("userId");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_status ON "Payment"("status");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_provider ON "Payment"("provider");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_created_at ON "Payment"("createdAt");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_updated_at ON "Payment"("updatedAt");`,

    // Passenger
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_passenger_user_status_created_at ON "Passenger"("userId", "status", "createdAt");`,

    // PriceAlert
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_alert_user_created_at ON "PriceAlert"("userId", "createdAt");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_alert_departure_date ON "PriceAlert"("departureDate");`,

    // SearchFavorite
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_favorite_user_created_at ON "SearchFavorite"("userId", "createdAt");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_favorite_departure_date ON "SearchFavorite"("departureDate");`,

    // Campaign
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_status ON "Campaign"("status");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_start_date ON "Campaign"("startDate");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_end_date ON "Campaign"("endDate");`,

    // SystemLog
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_log_timestamp ON "SystemLog"("timestamp");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_log_user_timestamp ON "SystemLog"("userId", "timestamp");`,

    // Session / Account
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_user ON "Session"("userId");`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_user ON "Account"("userId");`,
  ];

  // Wrap in a serial execution; CONCURRENTLY cannot run inside a transaction
  for (const sql of statements) {
    process.stdout.write(`[INDEX] ${sql}\n`);
    try {
      await client.query(sql);
    } catch (err) {
      // If index exists or column missing, show and continue
      console.error(`[WARN] ${err.message}`);
    }
  }

  await client.end();
  console.log('All concurrent indexes executed.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});


