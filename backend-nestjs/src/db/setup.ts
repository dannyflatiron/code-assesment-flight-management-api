import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import 'dotenv/config';

(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found in env variables.');
    console.error('DATABASE_URL=postgres://process.env.DB_USERNAME:process.env.DB_PASSWORD@localhost:5432/flight_management');
    process.exit(1);
  }

  // Initialize the connection pool
  const pool = new Pool({ connectionString });

  try {
    // Load and run schema.sql
    const schemaPath = join(__dirname, 'schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');
    await pool.query(sql);

    console.log('✅ Database schema applied successfully (flights + bookings seeded)');
  } catch (err) {
    console.error('❌ Failed to apply schema:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
