import express from 'express';
import dotenv from 'dotenv';
import router from './routes';
import cors from 'cors';
import http from 'http';

import { startBackupScheduler } from './controllers/scheduler/backupScheduler';
import { initWebSocket } from './socket/socket';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use('/api/v1', router);

const port = process.env.PORT || 1516;

const server = http.createServer(app);

initWebSocket(server);

server.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  await startBackupScheduler();
});
