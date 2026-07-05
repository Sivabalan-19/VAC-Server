require('dotenv').config();

const { initializeDatabase } = require('./config/db');

async function run() {
  await initializeDatabase();
  console.log('Database initialized');
}

run().catch((error) => {
  console.error('Database init failed:', error.message);
  process.exit(1);
});