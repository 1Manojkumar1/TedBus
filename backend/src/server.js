import 'dotenv/config';
import { createapp } from './app.js';
import { connectdatabase, disconnectdatabase } from './config/db.js';
import { autoSeedDatabase } from './seedData.js';
import { scanUpcomingJourneys, retryFailedDeliveries } from './services/notification.js';

const PORT = Number(process.env.PORT ?? 3000);
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/tedbus';

async function main() {
  try {
    await connectdatabase(MONGODB_URI);
    // Automatically ensure nationwide routes and community discussions are present
    await autoSeedDatabase();

    // Background schedulers: Journey reminders (every 30 mins) & delivery retries (every 10 mins)
    setInterval(() => {
      void scanUpcomingJourneys();
    }, 30 * 60 * 1000);

    setInterval(() => {
      void retryFailedDeliveries();
    }, 10 * 60 * 1000);
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    console.error(`Make sure MongoDB is running and reachable at ${MONGODB_URI}`);
    process.exit(1);
  }

  const app = createapp();
  const server = app.listen(PORT, () => {
    console.log(`Tedbus API listening on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectdatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
