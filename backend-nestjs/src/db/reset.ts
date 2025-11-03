import { Pool } from 'pg';
import 'dotenv/config';

(async () => {
  const connectionString =
    process.env.DATABASE_URL?.replace(/^postgresql:/, 'postgres:');
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('🧹 Clearing old data and resetting sequences...');
    await pool.query(`
      BEGIN;
      TRUNCATE TABLE bookings RESTART IDENTITY CASCADE;
      TRUNCATE TABLE flights  RESTART IDENTITY CASCADE;
      COMMIT;
    `);
    console.log('✅ Tables truncated and IDs reset.');

    // auto re-seed
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(sql);

    console.log('🌱 Database reseeded successfully (flights + bookings).');
  } catch (err) {
    console.error('❌ Failed to reset database:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
