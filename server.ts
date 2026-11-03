import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initDb } from './server/db.js';
import { checkAndMatureInvestments } from './server/utils.js';

import authRoutes from './server/routes/auth.js';
import depositRoutes from './server/routes/deposits.js';
import investmentRoutes from './server/routes/investments.js';
import withdrawalRoutes from './server/routes/withdrawals.js';
import supportRoutes from './server/routes/support.js';
import notificationRoutes from './server/routes/notifications.js';
import adminRoutes from './server/routes/admin.js';
import transactionRoutes from './server/routes/transactions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize Database Schema and seed defaults
  initDb();

  const app = express();
  const PORT = parseInt(process.env.DEFAULT_APP_PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/deposits', depositRoutes);
  app.use('/api/investments', investmentRoutes);
  app.use('/api/withdrawals', withdrawalRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/transactions', transactionRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'Agriculture Investment API', time: new Date().toISOString() });
  });

  // Scheduled background job: check for maturing livestock investments every 30 seconds
  setInterval(() => {
    try {
      checkAndMatureInvestments();
    } catch (e) {
      console.error('Scheduled investment check error:', e);
    }
  }, 30000);

  // Initial check on boot
  checkAndMatureInvestments();

  if (!isProduction) {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built client assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      // Fallback in case dist is not yet generated
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🌾 Agriculture Investment Platform running on port ${PORT}`);
    console.log(`📡 URL: http://0.0.0.0:${PORT}`);
    console.log(`🌱 Default Admin: admin@agricultureinvestment.com / AdminAgro2026!`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
