import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { doctorRouter } from './routes/doctors.js';
import { appointmentRouter } from './routes/appointments.js';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/appointments', appointmentRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
