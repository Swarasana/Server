import { randomUUID } from 'crypto';

export const generateGuestUsername = (): string => {
  const uuid = randomUUID().substring(0, 8);
  return `guest_${uuid}`;
};

export const isGuestUser = (username: string): boolean => {
  return username.startsWith('guest_');
};