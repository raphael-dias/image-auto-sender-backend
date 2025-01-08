import { Injectable } from '@nestjs/common';
import { generateUUID } from '../utils/uuid.generator';
import { generateKeys } from '../utils/keys.generator';
import { encrypt } from '../utils/key.encrypt';
import { decrypt } from '../utils/key.decrypt';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TestService {
  async test(): Promise<string> {
    const passphrase = process.env.PASSWORD;
    // Function to generate UUID
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
        console.log('Validation was successful!');
      } else {
        console.log('Validation failed.');
      }
    } catch (error) {
      console.error('Error executing query', error.message);
      throw new Error(`Error processing keys: ${error.message}`);
    }

    return 'SUCCESS';
  }
}
export class UserService {
  constructor() {}
  prismadb = new PrismaClient();
  async getUser(id?: string): Promise<any> {
    if (id) {
      const isExist = await this.prismadb.user.findUnique({
        where: {
          user_id: id,
        },
      });

      if (isExist && isExist.user_id) {
        return 'User already exists';
      }

      if (!isExist || !isExist.user_id) {
        return 'User not found';
      }
    }
    const uuid = generateUUID();
    const { publicKey, privateKey } = generateKeys();
    console.log(uuid, publicKey, privateKey);
    try {
      await this.prismadb.user.create({
        data: {
          public_key: publicKey,
          private_key: privateKey,
          favs: [],
          user_id: uuid,
          categories: [],
        },
      });
      return { uuid, publicKey };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}
