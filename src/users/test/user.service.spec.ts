import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../users.service'; // Ajuste o caminho conforme necessário
import { PrismaClient } from '@prisma/client';
import { generateKeys } from '../../utils/keys.generator';

// import { NotFoundException } from '@nestjs/common';

jest.mock('../../utils/keys.generator', () => ({
  generateKeys: jest.fn(), // Mock da função
}));

// jest.mock('@prisma/client', () => {
//   return {
//     PrismaClient: jest.fn().mockImplementation(() => ({
//       user: {
//         findUnique: jest.fn(),
//         create: jest.fn(),
//       },
//     })),
//   };
// });

const mockPrismaClient = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaClient;

describe('UserService', () => {
  let userService: UserService;
  let prisma: PrismaClient;
  const mockUser = {
    id: 1,
    user_id: '62860345-4488-42c4-9c8b-4289f4273660',
    public_key: `-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----`,
    private_key: `-----BEGIN ENCRYPTED PRIVATE KEY----- ... -----END ENCRYPTED PRIVATE KEY-----`,
    favs: ['1', '2'],
    categories: ['1', '2'],
    created_at: new Date('2025-01-08 16:03:51.556'),
  };

  beforeEach(async () => {
    process.env.PASSWORD = 'mock-passphrase';
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaClient],
    }).compile();

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should return user data when user exists', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

    const result = await userService.getUser(mockUser.user_id);

    expect(result).toEqual({
      userId: mockUser.user_id,
      publicKey: mockUser.public_key,
      favs: mockUser.favs,
      categories: mockUser.categories,
    });
  });

  it('should return "User not found" when user does not exist', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    const result = await userService.getUser('non-existent-id');
    expect(result).toBe('User not found');
  });

  describe('UserService Create', () => {
    it('should create a user successfully', async () => {
      const mockPublicKey = mockUser.private_key;
      const mockPrivateKey = mockUser.private_key;

      (generateKeys as jest.Mock).mockReturnValue({
        publicKey: mockPublicKey,
        privateKey: mockPrivateKey,
      });
      const regexExp =
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
      const userService = new UserService(mockPrismaClient);
      const result = await userService.createUser();
      const test = regexExp.test(result.uuid);

      expect(test).toBe(true);

      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          public_key: mockPublicKey,
          private_key: mockPrivateKey,
          favs: [],
          user_id: result.uuid,
          categories: [],
        },
      });
    });
    //
    //
    //
    it('should update user favs and categories when user exists', async () => {
      const deleteData = {
        favs: ['1'],
        categories: ['1'],
      };

      const updatedUser = {
        id: 1,
        user_id: mockUser.user_id,
        public_key: mockUser.public_key,
        private_key: mockUser.private_key,
        created_at: mockUser.created_at,
        favs: ['2'],
        categories: ['2'],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

      const result = await userService.deleteUserFavsAndCategories(
        mockUser.user_id,
        deleteData,
      );

      expect(result).toEqual(updatedUser);

      // Verifique se a função update foi chamada corretamente

      //   // Verifique se o findUnique foi chamado corretamente
      //   expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
      //     where: { user_id: mockUser.user_id },
      //   });

      //   // Verifique se a atualização foi chamada corretamente
      //   expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
      //     where: { user_id: mockUser.user_id },
      //     data: {
      //       favs: ['2', '3'],
      //       categories: ['1'],
      //     },
      //   });
      // });

      // it('should throw NotFoundException if user not found', async () => {
      //   const userId = 'non-existing-user-id';
      //   const deleteData = {
      //     favs: ['1'],
      //     categories: ['2'],
      //   };

      //   // Mockando o retorno do findUnique para retornar null (usuário não encontrado)
      //   jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      //   // Assegure que uma exceção seja lançada
      //   await expect(
      //     userService.deleteUserFavsAndCategories(userId, deleteData),
      //   ).rejects.toThrowError(new NotFoundException('User not found'));

      //   // Verifique se o findUnique foi chamado corretamente
      //   expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
      //     where: { user_id: userId },
      //   });

      //   // Não deve chamar a função update, já que o usuário não foi encontrado
      //   expect(mockPrismaClient.user.update).not.toHaveBeenCalled();
      // });

      // it('should return empty arrays if no favs or categories exist to delete', async () => {
      //   const userId = '62860345-4488-42c4-9c8b-4289f4273660';
      //   const deleteData = {
      //     favs: ['5'], // Favoritos não existentes
      //     categories: ['3'], // Categorias não existentes
      //   };

      //   const updatedUser = {
      //     user_id: userId,
      //     favs: ['1', '2', '3'], // Não há favoritos a serem excluídos
      //     categories: ['1', '2'], // Não há categorias a serem excluídas
      //   };

      //   // Mockando o retorno do findUnique
      //   jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      //   // Mockando a atualização do usuário
      //   jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      //   // Chame a função que você quer testar
      //   const result = await userService.deleteUserFavsAndCategories(
      //     userId,
      //     deleteData,
      //   );

      //   // Assegure que o resultado seja o esperado
      //   expect(result).toEqual(updatedUser);

      //   // Verifique se o findUnique foi chamado corretamente
      //   expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
      //     where: { user_id: userId },
      //   });

      //   // Verifique se a atualização foi chamada corretamente
      //   expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
      //     where: { user_id: userId },
      //     data: {
      //       favs: ['1', '2', '3'],
      //       categories: ['1', '2'],
      //     },
      //   });
    });
  });
});
