import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { jwtConstants } from './constants';
  import { Request } from 'express';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('No authentication token found');
      }
  
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: jwtConstants.secret,
        });
  
        // Ensure payload contains roles as an array
        if (!payload.role || !Array.isArray(payload.role)) {
          throw new UnauthorizedException('Invalid token payload');
        }
  
        // Attach user to the request
        request['user'] = {
          id: payload.id,
          email: payload.email,
          roles: payload.role, // Rename from role to roles for consistency
        };
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
  
      return true;
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
  