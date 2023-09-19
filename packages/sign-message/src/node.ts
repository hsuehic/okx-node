import { createHmac } from 'crypto';

export async function signMessage(message: string, secret: string) {
  await Promise.resolve(true);
  return createHmac('sha256', secret).update(message).digest('base64');
}
