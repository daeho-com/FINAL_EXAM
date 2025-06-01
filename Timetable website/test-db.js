require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
  const [rows] = await pool.query('SELECT 1 + 1 AS result');
  console.log('DB 연결 성공, 1+1=', rows[0].result);
  process.exit();
}

test().catch(err => {
  console.error('DB 연결 실패:', err);
  process.exit(1);
});