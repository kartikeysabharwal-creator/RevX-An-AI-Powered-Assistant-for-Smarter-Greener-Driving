import { app } from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`\n=============================================================`);
  console.log(`  REVX API SERVER LISTENING ON http://localhost:${config.port}`);
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  Version: 1.4.0`);
  console.log(`  Health Check: http://localhost:${config.port}/api/v1/health`);
  console.log(`  Dashboard:    http://localhost:${config.port}/api/v1/analytics/dashboard`);
  console.log(`=============================================================\n`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
