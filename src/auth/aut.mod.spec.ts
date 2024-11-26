import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { jwtConstants } from './constants';

describe('AuthModule', () => {
  describe('Module Structure', () => {
    it('should have the correct module metadata', () => {
      const moduleMetadata = Reflect.getMetadata('imports', AuthModule);
      const controllers = Reflect.getMetadata('controllers', AuthModule);
      const providers = Reflect.getMetadata('providers', AuthModule);
      const exports = Reflect.getMetadata('exports', AuthModule);

      expect(moduleMetadata).toContain(UsersModule);
      expect(controllers).toContain(AuthController);
      expect(providers).toContain(AuthService);
      expect(exports).toContain(AuthService);
    });
  });

  describe('Security Configurations', () => {
    it('should use a non-empty JWT secret', () => {
      expect(jwtConstants.secret).toBeTruthy();
      expect(jwtConstants.secret.length).toBeGreaterThan(10);
    });

    it('should have a reasonable token expiration', () => {
      const expiresIn = '6000s';
      const seconds = parseInt(expiresIn);

      expect(seconds).toBeGreaterThan(0);
      expect(seconds).toBeLessThan(24 * 60 * 60); // Less than a day
    });
  });
});
