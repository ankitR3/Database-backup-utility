import express from 'express';
import dotenv from 'dotenv';
import router from './routes';
import { startBackupScheduler } from './controllers/scheduler/backupScheduler';

dotenv.config();
const app = express();
const port = process.env.PORT || 1516;
app.use(express.json());

app.use('/api/v1', router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

startBackupScheduler();