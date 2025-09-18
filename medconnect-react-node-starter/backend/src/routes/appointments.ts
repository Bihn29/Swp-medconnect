import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { createAppointment, mockPaymentSuccess, myAppointments } from '../controllers/appointments.js';

export const appointmentRouter = Router();
appointmentRouter.post('/', requireAuth, createAppointment);
appointmentRouter.post('/mock-webhook', mockPaymentSuccess);
appointmentRouter.get('/me', requireAuth, myAppointments);
