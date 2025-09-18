import { prisma } from '../services/prisma.js';
import bcrypt from 'bcryptjs';
import { signJwt } from '../utils/jwt.js';
import { Request, Response } from 'express';

export async function register(req: Request, res: Response) {
  const { email, password, fullName, role } = req.body;
  if (!email || !password || !fullName || !role) return res.status(400).json({ message: 'Missing fields' });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email already in use' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash, fullName, role } });
  return res.json({ id: user.id });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signJwt({ id: user.id, email: user.email, role: user.role });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } });
}
