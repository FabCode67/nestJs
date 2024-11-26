import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    fullName: 'Test User',
    roles: ['user'],
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    mockAuthService = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should validate user credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      (mockAuthService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      const result = await controller.create(loginDto);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle login failure', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      (mockAuthService.validateUser as jest.Mock).mockResolvedValue(null);
      const result = await controller.create(loginDto);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const result = controller.getProfile(mockRequest as any);
      expect(result).toEqual(mockUser);
    });
  });
});
