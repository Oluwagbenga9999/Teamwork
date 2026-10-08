import pool from '../src/db/index.js';

after(async () => {
  await pool.end();
});