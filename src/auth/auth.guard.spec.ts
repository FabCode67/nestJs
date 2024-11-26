import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let mockJwtService: Partial<JwtService>;

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
  } as unknown as ExecutionContext;

  const mockPayload = {
    id: 'user-id',
    email: 'test@example.com',
    role: ['user'],
  };

  beforeEach(async () => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no token is present', async () => {
      const mockRequest = {
        headers: {},
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('No authentication token found'),
      );
    });

    it('should throw UnauthorizedException when token is not a Bearer token', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Invalid Token',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('No authentication token found'),
      );
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      (mockJwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('Invalid token', 'Invalid token'),
      );
    });

    it('should throw UnauthorizedException when token payload is invalid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const invalidPayload = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'not-an-array',
      };

      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue(
        invalidPayload,
      );
    });

    it('should return true and set user on request when token is valid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);

      const result = await authGuard.canActivate(mockExecutionContext);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: jwtConstants.secret,
      });

      const requestAfterGuard = mockExecutionContext
        .switchToHttp()
        .getRequest();
      expect(requestAfterGuard['user']).toEqual({
        id: mockPayload.id,
        email: mockPayload.email,
        roles: mockPayload.role,
      });

      expect(result).toBe(true);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should return undefined when no authorization header is present', () => {
      const mockRequest = { headers: {} };
      const extractMethod = (authGuard as any).extractTokenFromHeader;

      const result = extractMethod(mockRequest);
      expect(result).toBeUndefined();
    });

    it('should return undefined when authorization header is not a Bearer token', () => {
      const mockRequest = {
        headers: {
          authorization: 'Basic sometoken',
        },
      };
      const extractMethod = (authGuard as any).extractTokenFromHeader;

      const result = extractMethod(mockRequest);
      expect(result).toBeUndefined();
    });

    it('should return token when authorization header is a valid Bearer token', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };
      const extractMethod = (authGuard as any).extractTokenFromHeader;

      const result = extractMethod(mockRequest);
      expect(result).toBe('valid-token');
    });
  });
});
