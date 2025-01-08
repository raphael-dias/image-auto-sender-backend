import * as crypto from 'crypto';

// Function to decrypt  private key
export function decrypt(
  encryptedText: string,
  privateKey: string,
  passphrase: string,
): string {
  try {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase: passphrase,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(encryptedText, 'base64'),
    );
    return decrypted.toString('utf8'); // Returns as plain text
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed');
  }
}
