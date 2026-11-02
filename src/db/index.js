import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
  max: process.env.VERCEL ? 1 : 10,
});

export default pool;