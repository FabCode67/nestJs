import { Role, isRole } from './role.enum';

describe('Role Enum', () => {
  it('should have correct enum values', () => {
    expect(Role.Admin).toBe('Admin');
    expect(Role.User).toBe('User');
    expect(Role.Moderator).toBe('Moderator');
  });

  it('should have the correct number of roles', () => {
    const roleValues = Object.values(Role);
    expect(roleValues.length).toBe(3);
  });

  it('should be immutable', () => {
    const originalAdmin = Role.Admin;

    // This will cause a TypeScript compilation error
    // (Role.Admin as any) = 'SomeOtherRole';

    expect(Role.Admin).toBe(originalAdmin);
  });

  it('should support string comparisons', () => {
    expect(Role.Admin === 'Admin').toBe(true);
    expect(Role.User === 'User').toBe(true);
    expect(Role.Moderator === 'Moderator').toBe(true);
  });

  it('should work with type checking', () => {
    const checkRole = (role: Role) => {
      return role;
    };

    expect(() => checkRole(Role.Admin)).not.toThrow();
    expect(() => checkRole(Role.User)).not.toThrow();
    expect(() => checkRole(Role.Moderator)).not.toThrow();
  });

  it('should allow iteration over roles', () => {
    const roles = Object.values(Role);

    expect(roles).toContain('Admin');
    expect(roles).toContain('User');
    expect(roles).toContain('Moderator');
  });

  it('should provide type guard for role validation', () => {
    expect(isRole('Admin')).toBe(true);
    expect(isRole('User')).toBe(true);
    expect(isRole('Moderator')).toBe(true);
    expect(isRole('InvalidRole')).toBe(false);
  });
});
