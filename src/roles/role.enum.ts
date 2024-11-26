export const Role = {
  Admin: 'Admin',
  User: 'User',
  Moderator: 'Moderator',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export function isRole(value: unknown): value is Role {
  return Object.values(Role).includes(value as Role);
}
