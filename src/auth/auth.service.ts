import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
   async getProfile(id: string) {
     const user = await this.usersService.findById(id);
     if (!user) throw new UnauthorizedException();
     return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt};
   }

  register(body: {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
  }) {
    return this.usersService.register(body);
  }

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(email);
    // Vergelijk het ingevoerde wachtwoord met de opgeslagen hash
    if (!user || !(await bcrypt.compare(pass, user.passwordHash))) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      // De JWT-sleutel waarmee de payload wordt ondertekend komt uit de JwtModule
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
