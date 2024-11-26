import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ROLES_KEY } from './roles.decorator';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let mockReflector: Partial<Reflector>;
  const createMockExecutionContext = (
    requiredRoles: string[] | undefined,
    userRoles: string[] = [],
  ) => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            roles: userRoles,
          },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();
    rolesGuard = module.get<RolesGuard>(RolesGuard);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      const context = createMockExecutionContext(undefined);
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
      const result = rolesGuard.canActivate(context);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when user is not found', () => {
      const context = {
        ...createMockExecutionContext(['admin']),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: null,
          }),
        }),
      } as unknown as ExecutionContext;
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);

      expect(() => rolesGuard.canActivate(context)).toThrow(
        new UnauthorizedException('User not found'),
      );
    });

    it('should throw UnauthorizedException when user lacks required role', () => {
      const context = createMockExecutionContext(['admin'], ['user']);
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
      expect(() => rolesGuard.canActivate(context)).toThrow(
        new UnauthorizedException('Insufficient permissions'),
      );
    });

    it('should return true when user has at least one required role', () => {
      const context = createMockExecutionContext(
        ['admin', 'moderator'],
        ['moderator'],
      );
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue([
        'admin',
        'moderator',
      ]);
      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true when user has multiple roles and one matches', () => {
      const context = createMockExecutionContext(
        ['admin'],
        ['user', 'admin', 'editor'],
      );
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should handle case-sensitive role comparison', () => {
      const context = createMockExecutionContext(['Admin'], ['admin']);
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['Admin']);
      expect(() => rolesGuard.canActivate(context)).toThrow(
        new UnauthorizedException('Insufficient permissions'),
      );
    });
  });
});
