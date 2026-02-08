import express from 'express';
import dotenv from 'dotenv';
import router from './routes';
import cors from 'cors';
import { startBackupScheduler } from './controllers/scheduler/backupScheduler';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use('/api/v1', router);

const port = process.env.PORT || 1516;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

startBackupScheduler();