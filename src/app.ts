import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

import collectionsRoutes from './routes/collections';
import commentsRoutes from './routes/comments';
import exhibitionsRoutes from './routes/exhibitions';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: `Server is running at ${new Date().toISOString()}`,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/collections', collectionsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/exhibitions', exhibitionsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;