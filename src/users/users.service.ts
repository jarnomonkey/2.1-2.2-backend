import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '../prisma/generated/prisma/client.js';

// Rollen die iemand zelf mag kiezen bij het registreren
const SELF_SERVICE_ROLES: string[] = [Role.STUDENT, Role.CURSIST, Role.DOCENT];

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Zoekt een gebruiker op e-mailadres (of null als die niet bestaat)
  findOne(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  // Maakt een gebruiker aan; het wachtwoord wordt gehasht opgeslagen
  async create(data: {
    email: string;
    name: string;
    password: string;
    role?: Role;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email.trim().toLowerCase(),
        name: data.name,
        passwordHash,
        role: data.role ?? Role.STUDENT,
      },
    });
  }
  findById(id: string) {
     return this.prisma.user.findUnique({ where: { id } });
   }

  async getTeachers() {
    return this.prisma.user.findMany({
      where: { role: Role.DOCENT },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
  }

  async getTeacher(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        role: true,
        teacher: { select: { id: true, name: true, email: true } },
      },
    });

    if (!student || (student.role !== Role.STUDENT && student.role !== Role.CURSIST)) {
      throw new NotFoundException('Student of cursist niet gevonden');
    }

    return student.teacher;
  }

  async connectToTeacher(studentId: string, teacherId: string) {
    const [student, teacher] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: studentId }, select: { role: true } }),
      this.prisma.user.findUnique({
        where: { id: teacherId },
        select: { id: true, name: true, email: true, role: true },
      }),
    ]);

    if (!student || (student.role !== Role.STUDENT && student.role !== Role.CURSIST)) {
      throw new BadRequestException('Alleen studenten en cursisten kunnen een docent kiezen');
    }
    if (!teacher || teacher.role !== Role.DOCENT) {
      throw new NotFoundException('Docent niet gevonden');
    }

    await this.prisma.user.update({
      where: { id: studentId },
      data: { teacherId },
    });

    return { teacher: { id: teacher.id, name: teacher.name, email: teacher.email } };
  }

  async disconnectFromTeacher(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true },
    });

    if (!student || (student.role !== Role.STUDENT && student.role !== Role.CURSIST)) {
      throw new NotFoundException('Student of cursist niet gevonden');
    }

    await this.prisma.user.update({
      where: { id: studentId },
      data: { teacherId: null },
    });

    return { teacher: null };
  }

  // Registratie door een gebruiker zelf: valideert de invoer en geeft nooit
  // de passwordHash terug
  async register(data: {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
  }) {
    const email = data.email?.trim().toLowerCase();
    const name = data.name?.trim();
    const password = data.password;
    const role = data.role ?? Role.STUDENT;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Ongeldig e-mailadres');
    }
    if (!name) {
      throw new BadRequestException('Naam is verplicht');
    }
    if (!password || password.length < 8) {
      throw new BadRequestException('Wachtwoord moet minstens 8 tekens hebben');
    }
    if (!SELF_SERVICE_ROLES.includes(role)) {
      throw new BadRequestException('Ongeldige rol');
    }

    try {
      const user = await this.create({
        email,
        name,
        password,
        role: role as Role,
      });
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002') {
        throw new ConflictException('Dit e-mailadres is al in gebruik');
      }
      throw err;
    }
  }
}
