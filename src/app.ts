import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import rolesRoutes from './routes/roles';
import adminsRoutes from './routes/admins';
import logsRoutes from './routes/logs';
import usersRoutes from './routes/users';
import petTypesRoutes from './routes/petTypes';
import petCharacteristicsRoutes from './routes/petCharacteristics';
import petsRoutes from './routes/pets';
import caregiverSearchRoutes from './routes/caregiverSearch';
import reservationsRoutes from './routes/reservations';
import paymentsRoutes from './routes/payments';
import reviewsRoutes from './routes/reviews';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pet-types', petTypesRoutes);
app.use('/api/pet-characteristics', petCharacteristicsRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/caregiver-search', caregiverSearchRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api', reviewsRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Error handling middleware (must be at the end)
app.use(errorHandler);

// MongoDB connection and server startup
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err);
  });
