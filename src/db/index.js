import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });

export default pool;