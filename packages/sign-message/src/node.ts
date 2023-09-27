import { createHmac, randomUUID as createRandomUUID } from 'crypto';

export async function signMessage(message: string, secret: string) {
  await Promise.resolve(true);
  return createHmac('sha256', secret).update(message).digest('base64');
}

export const randomUUID = (): string => {
  return createRandomUUID();
};
