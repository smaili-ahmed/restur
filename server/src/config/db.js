const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  ...config.db,
  ssl: config.env === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client', err.message);
});

module.exports = pool;
