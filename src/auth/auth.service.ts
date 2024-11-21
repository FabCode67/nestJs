import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) return 'User not found';
    if (user.password !== password) throw new UnauthorizedException();
    const payload = { id: user.id, email: user.email, role: user.roles };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
