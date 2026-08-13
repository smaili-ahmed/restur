const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const run = async () => {
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT, 10) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: 'postgres',
  });

  const dbName = process.env.PGDATABASE || 'cyberguard';
  const exists = await pool.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (exists.rowCount === 0) {
    await pool.query(`CREATE DATABASE "${dbName}"`);
    console.log(`[db] Database "${dbName}" created.`);
  } else {
    console.log(`[db] Database "${dbName}" already exists.`);
  }
  await pool.end();

  const appPool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT, 10) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: dbName,
  });

  const migrationsDir = path.resolve(__dirname, '../src/db/migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await appPool.query(sql);
    console.log(`[db] Applied migration: ${file}`);
  }
  await appPool.end();
  console.log('[db] Migrations complete.');
};

run().catch((err) => {
  console.error('[db] Migration failed:', err.message);
  process.exit(1);
});
