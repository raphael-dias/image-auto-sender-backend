import { encrypt } from './key.encrypt';
import { decrypt } from './key.decrypt';

export function validate(publicKey: string, privateKey: string): boolean {
  const passphrase = process.env.PASSWORD;
  try {
    const text = 'Texto para validação de chave';

    // Encrypt with the public key
    const encryptedText = encrypt(text, publicKey);

    // Decrypt with private key
    const decryptedText = decrypt(encryptedText, privateKey, passphrase);

    // If the decrypted text is the same as the original text, validation was successful
    return decryptedText === text;
  } catch (error) {
    console.error('Error validating keys:', error);
    throw new Error('Error validating keys');
  }
}
