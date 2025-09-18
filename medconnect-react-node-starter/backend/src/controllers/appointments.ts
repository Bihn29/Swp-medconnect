import { prisma } from '../services/prisma.js';
import { Request, Response } from 'express';

// Create appointment (pending)
export async function createAppointment(req: Request, res: Response) {
  const user = (req as any).user;
  const { doctorId, startAt, endAt, type, reason } = req.body;
  if (!doctorId || !startAt || !endAt || !type) return res.status(400).json({ message: 'Missing fields' });

  const doctor = await prisma.user.findFirst({ where: { id: doctorId, role: 'DOCTOR', doctor: { is: { verified: true } } } });
  if (!doctor) return res.status(400).json({ message: 'Doctor not available' });

  const appt = await prisma.appointment.create({
    data: {
      doctorId,
      patientId: user.id,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      type,
      status: 'pending',
      reason
    }
  });

  // Mock payment init
  const pay = await prisma.payment.create({
    data: {
      appointmentId: appt.id,
      provider: 'sandbox',
      status: 'initiated',
      amount: 200000
    }
  });

  res.json({ appointmentId: appt.id, paymentId: pay.id, checkoutUrl: `/mock-pay/${pay.id}` });
}

// Mock webhook success → confirm appointment
export async function mockPaymentSuccess(req: Request, res: Response) {
  const { paymentId } = req.body;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  await prisma.payment.update({ where: { id: paymentId }, data: { status: 'success' } });
  await prisma.appointment.update({ where: { id: payment.appointmentId }, data: { status: 'confirmed' } });

  res.json({ ok: true });
}

// List appointments for current user
export async function myAppointments(req: Request, res: Response) {
  const user = (req as any).user;
  const appts = await prisma.appointment.findMany({
    where: { OR: [{ patientId: user.id }, { doctorId: user.id }] },
    orderBy: { startAt: 'desc' },
    include: { payment: true, review: true }
  });
  res.json(appts);
}
