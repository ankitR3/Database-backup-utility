import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 1516;

// app.post('/api', );

app.listen(port);