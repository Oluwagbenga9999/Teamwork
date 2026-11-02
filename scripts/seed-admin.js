import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from '../src/db/index.js';

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD');
  process.exit(1);
}

const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
await pool.query(
  `INSERT INTO users (first_name, last_name, email, password, is_admin)
   VALUES ('Admin', 'User', $1, $2, TRUE)
   ON CONFLICT (email) DO UPDATE SET is_admin = TRUE`,
  [ADMIN_EMAIL, hash],
);
console.log('Admin ready');
await pool.end();