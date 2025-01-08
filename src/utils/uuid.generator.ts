import { randomBytes } from 'crypto';

// Function to generate UUID
export function generateUUID(): string {
  const buffer = randomBytes(16);

  // Modify a few bits to ensure it is a v4 UUID
  buffer[6] = (buffer[6] & 0x0f) | 0x40; // Versão 4
  buffer[8] = (buffer[8] & 0x3f) | 0x80; // Variante DCE

  // Format the buffer as a UUID
  const uuid = buffer.toString('hex');
  return `${uuid.substring(0, 8)}-${uuid.substring(8, 12)}-${uuid.substring(12, 16)}-${uuid.substring(16, 20)}-${uuid.substring(20, 32)}`;
}
