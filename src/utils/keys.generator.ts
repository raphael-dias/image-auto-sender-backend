import * as crypto from 'crypto';

// Set the return type to an object with the public and private keys as strings
export function generateKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Key length (in bits)
    publicKeyEncoding: {
      type: 'spki', // Format for the public key
      format: 'pem', // PEM format (commonly used)
    },
    privateKeyEncoding: {
      type: 'pkcs8', // Format for private key
      format: 'pem', // PEM format (commonly used)
      cipher: 'aes-256-cbc', // Encrypt the private key with AES
      passphrase: process.env.PASSWORD,
    },
  });

  return { publicKey, privateKey };
}
