import app from './app.js';
import { testConnection } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('----------------------------------------------------');
    console.log('Starting DBMS Learning Progress Management Server...');
    console.log('----------------------------------------------------');

    // Test MySQL connectivity on startup
    const dbStatus = await testConnection();
    if (!dbStatus.success) {
      console.warn('[Warning] MySQL connection could not be established on startup:', dbStatus.error);
      console.warn('[Warning] Ensure MySQL service is running and credentials in .env are correct.');
    }

    const server = app.listen(PORT, () => {
      console.log(`[Server] Express REST API running on http://localhost:${PORT}`);
      console.log(`[Server] Health Check available at http://localhost:${PORT}/api/health`);
      console.log(`[Server] Database Overview at http://localhost:${PORT}/api/database/overview`);
      console.log('----------------------------------------------------');
    });

    const shutdown = () => {
      console.log('[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    console.error('[Server Error] Failed to launch server:', err);
    process.exit(1);
  }
};

startServer();
