import { Router } from 'express';
import { listDoctors, getDoctor } from '../controllers/doctors.js';

export const doctorRouter = Router();
doctorRouter.get('/', listDoctors);
doctorRouter.get('/:id', getDoctor);
