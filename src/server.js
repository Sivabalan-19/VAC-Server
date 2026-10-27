require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();

const app = require('./app');
const { initializeDatabase } = require('./config/db');

const port = process.env.PORT || 5000;

async function startServer() {
  await initializeDatabase();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});