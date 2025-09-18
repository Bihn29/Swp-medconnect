import { prisma } from '../services/prisma.js';
import { Request, Response } from 'express';

export async function listDoctors(req: Request, res: Response) {
  const q = String(req.query.q || '');
  const docs = await prisma.user.findMany({
    where: { role: 'DOCTOR', doctor: { is: { verified: true, OR: [
      { specialization: { contains: q, mode: 'insensitive' } },
      { bio: { contains: q, mode: 'insensitive' } }
    ] } } },
    select: { id: true, fullName: true, email: true, doctor: true }
  });
  res.json(docs);
}

export async function getDoctor(req: Request, res: Response) {
  const id = String(req.params.id);
  const doc = await prisma.user.findFirst({
    where: { id, role: 'DOCTOR' },
    select: { id: true, fullName: true, email: true, doctor: true }
  });
  if (!doc) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doc);
}
