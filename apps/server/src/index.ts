import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes';
import backupRouter from './routes/backupRoutes';

dotenv.config();
const app = express();
const port = process.env.PORT || 1516;
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/backup', backupRouter)

app.listen(port);