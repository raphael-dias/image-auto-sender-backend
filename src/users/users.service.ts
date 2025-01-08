import { Injectable } from '@nestjs/common';
import { generateUUID } from '../utils/uuid.generator';
import { generateKeys } from '../utils/keys.generator';
import { encrypt } from '../utils/key.encrypt';
import { decrypt } from '../utils/key.decrypt';

@Injectable()
export class TestService {
  async test(): Promise<string> {
    const passphrase = process.env.PASSWORD;
    // // Function to generate UUID
    const uuid = generateUUID();
    console.log(uuid);

    // Generate public and private keys
    try {
      const { publicKey, privateKey } = generateKeys();

      const encryptedKey = encrypt(uuid, publicKey);
      console.log('encryptedKey');
      console.log(encryptedKey);

      const decriptedKey = decrypt(encryptedKey, privateKey, passphrase);
      console.log('DECRYPTED KEY');
      console.log(decriptedKey);

      if (decriptedKey === uuid) {
        console.log('A validação foi bem-sucedida!');
      } else {
        console.log('A validação falhou.');
      }
    } catch (error) {
      console.error('Erro ao executar consulta', error.message);
      throw new Error(`Error processing keys: ${error.message}`);
    }

    return 'SUCCESS';
  }
}
export class UserService {
  getUser(): any {
    return 'SUCCESS';
  }
}
