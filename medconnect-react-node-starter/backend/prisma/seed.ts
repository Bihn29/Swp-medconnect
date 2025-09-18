import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@medconnect.local' },
    update: {},
    create: {
      email: 'admin@medconnect.local',
      password,
      fullName: 'System Admin',
      role: 'ADMIN' as Role
    }
  });

  const docUser = await prisma.user.upsert({
    where: { email: 'doctor@medconnect.local' },
    update: {},
    create: {
      email: 'doctor@medconnect.local',
      password,
      fullName: 'Dr. House',
      role: 'DOCTOR' as Role,
      doctor: {
        create: { specialization: 'General Medicine', verified: true, bio: '15 years experience' }
      }
    }
  });

  const patient = await prisma.user.upsert({
    where: { email: 'patient@medconnect.local' },
    update: {},
    create: {
      email: 'patient@medconnect.local',
      password,
      fullName: 'John Patient',
      role: 'PATIENT' as Role
    }
  });

  console.log({ admin, docUser, patient });
}

main().finally(async () => prisma.$disconnect());
