import * as crypto from 'crypto';

// Function to encrypt a private key
export function encrypt(data: string, publicKey: string): string {
  try {
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // Padding to increase security
        oaepHash: 'sha256', // Hash using OAEP
      },
      Buffer.from(data),
    );
    return encrypted.toString('base64'); // base64 return
  } catch (error) {
    console.error('Error encrypting:', error);
    throw new Error('Error encrypting.');
  }
}
