import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: Partial<UsersService>;
  let mockJwtService: Partial<JwtService>;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'correct-password',
    roles: ['user'],
  };

  beforeEach(async () => {
    mockUsersService = {
      findByEmail: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return "User not found" when user does not exist', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser(
        'nonexistent@example.com',
        'password',
      );

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
      expect(result).toBe('User not found');
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.validateUser(mockUser.email, 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token when credentials are correct', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const mockToken = 'mock-access-token';
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue(mockToken);

      const result = await authService.validateUser(
        mockUser.email,
        mockUser.password,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.roles,
      });
      expect(result).toEqual({
        access_token: mockToken,
      });
    });

    it('should call findByEmail with the correct email', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('mock-token');
      await authService.validateUser('test@example.com', mockUser.password);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });
  });
});
