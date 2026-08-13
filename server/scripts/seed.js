const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const run = async () => {
  const { name, email, password } = require('../src/config').seedAdmin;
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    console.log('[seed] Admin already exists, skipping.');
  } else {
    const hash = await bcrypt.hash(password, 12);
    const res = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, name, email, role`,
      [name, email, hash]
    );
    console.log('[seed] Admin created:', res.rows[0]);
  }

  const users = [
    ['Ahmed', 'ahmed.gourmet@gmail.com', 'User123!', 'user'],
    ['Sarah', 'sarah.gourmet@gmail.com', 'User123!', 'user'],
    ['Lina', 'lina.gourmet@gmail.com', 'User123!', 'user'],
    ['Youssef', 'youssef.gourmet@gmail.com', 'User123!', 'user'],
    ['Emma', 'emma.gourmet@gmail.com', 'User123!', 'user'],
    ['Karim', 'karim.gourmet@gmail.com', 'User123!', 'user'],
    ['Nour', 'nour.gourmet@gmail.com', 'User123!', 'user'],
    ['Omar', 'omar.gourmet@gmail.com', 'User123!', 'user'],
    ['Léa', 'lea.gourmet@gmail.com', 'User123!', 'user'],
    ['Hugo', 'hugo.gourmet@gmail.com', 'User123!', 'user'],
    ['Inès', 'ines.gourmet@gmail.com', 'User123!', 'user'],
    ['Paul', 'paul.gourmet@gmail.com', 'User123!', 'user'],
  ];
  for (const [uname, uemail, upass, urole] of users) {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [uemail]);
    if (exists.rowCount > 0) continue;
    const hash = await bcrypt.hash(upass, 12);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      [uname, uemail, hash, urole]
    );
    console.log(`[seed] User created: ${uemail}`);
  }

  const blockRes = await pool.query(
    `INSERT INTO blocked_ips (ip_address, reason) VALUES ($1, $2)
     ON CONFLICT (ip_address) DO NOTHING RETURNING ip_address`,
    ['203.0.113.42', 'Brute-force attempts detected']
  );
  if (blockRes.rowCount > 0) console.log('[seed] Blocked IP seeded:', blockRes.rows[0].ip_address);

  const creds = await pool.query(
    `SELECT name, email, role FROM users ORDER BY role DESC, name ASC`
  );
  console.log('\n[seed] Comptes disponibles (gmail + mot de passe):');
  for (const u of creds.rows) {
    const pwd = u.role === 'admin' ? 'Admin123!' : 'User123!';
    console.log(`  ${u.role.padEnd(5)}  ${u.email.padEnd(32)}  ${pwd.padEnd(10)}  (${u.name})`);
  }

  await pool.end();
  console.log('[seed] Done.');
};

run().catch((err) => {
  console.error('[seed] Failed:', err.message);
  process.exit(1);
});
