import { Injectable, NotFoundException } from '@nestjs/common';
import { generateUUID } from '../utils/uuid.generator';
import { generateKeys } from '../utils/keys.generator';
//import { encrypt } from '../utils/key.encrypt';
//import { decrypt } from '../utils/key.decrypt';
import { PrismaClient } from '@prisma/client';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
// export class TestService {
//   async test(): Promise<string> {
//     const passphrase = process.env.PASSWORD;
//     // Function to generate UUID
//     const uuid = generateUUID();
//     console.log(uuid);

//     // Generate public and private keys
//     try {
//       const { publicKey, privateKey } = generateKeys();

//       const encryptedKey = encrypt(uuid, publicKey);
//       console.log('encryptedKey');
//       console.log(encryptedKey);

//       const decriptedKey = decrypt(encryptedKey, privateKey, passphrase);
//       console.log('DECRYPTED KEY');
//       console.log(decriptedKey);

//       if (decriptedKey === uuid) {
//         console.log('Validation was successful!');
//       } else {
//         console.log('Validation failed.');
//       }
//     } catch (error) {
//       console.error('Error executing query', error.message);
//       throw new Error(`Error processing keys: ${error.message}`);
//     }

//     return 'SUCCESS';
//   }
// }
export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  //Get user data
  async getUser(id: string): Promise<any> {
    const a = await this.prisma.user.findUnique({
      where: {
        user_id: id,
      },
    });
    console.log(a);
    try {
      const isExist = await this.prisma.user.findUnique({
        where: {
          user_id: id,
        },
      });
      return {
        userId: isExist.user_id,
        publicKey: isExist.public_key,
        favs: isExist.favs,
        categories: isExist.categories,
      };
    } catch (error) {
      return 'User not found';
    }
  }
  async createUser() {
    const uuid = generateUUID();
    const { publicKey, privateKey } = generateKeys();
    console.log(uuid, publicKey, privateKey);
    try {
      await this.prisma.user.create({
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

  async deleteUserFavsAndCategories(
    id: string,
    deleteData: UpdateUserDto,
  ): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        user_id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedFavs = user.favs
      ? user.favs.filter((fav: string) => !deleteData.favs.includes(fav))
      : [];
    const updatedCategories = user.categories
      ? user.categories.filter(
          (category: string) => !deleteData.categories.includes(category),
        )
      : [];

    return this.prisma.user.update({
      where: {
        user_id: id,
      },
      data: {
        favs: updatedFavs,
        categories: updatedCategories,
      },
    });
  }

  async updateUserFavsAndCategories(
    id: string,
    updateData: UpdateUserDto,
  ): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        user_id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Merges existing favs and categories with the new ones, ensuring no duplicates.
    const updatedFavs = Array.from(
      new Set([...(user.favs || []), ...(updateData.favs || [])]),
    );
    const updatedCategories = Array.from(
      new Set([...(user.categories || []), ...(updateData.categories || [])]),
    );

    return this.prisma.user.update({
      where: {
        user_id: id,
      },
      data: {
        favs: updatedFavs,
        categories: updatedCategories,
      },
    });
  }
}
