import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../users.service'; // Ajuste o caminho conforme necessário
import { PrismaClient } from '@prisma/client';
import { generateKeys } from '../../utils/keys.generator';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

// import { NotFoundException } from '@nestjs/common';

jest.mock('../../utils/keys.generator', () => ({
  generateKeys: jest.fn(), // Mock da função
}));

const mockUser = {
  id: 1,
  user_id: '62860345-4488-42c4-9c8b-4289f4273660',
  public_key: `-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----`,
  private_key: `-----BEGIN ENCRYPTED PRIVATE KEY----- ... -----END ENCRYPTED PRIVATE KEY-----`,
  favs: ['1', '2'],
  categories: ['1', '2'],
  created_at: new Date('2025-01-08 16:03:51.556'),
};

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

  beforeEach(async () => {
    process.env.PASSWORD = 'mock-passphrase';
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaClient],
    }).compile();

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('UserService - getUser', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

    const result = await userService.getUser(mockUser.user_id);

    expect(result).toEqual({
      userId: mockUser.user_id,
      publicKey: mockUser.public_key,
      favs: mockUser.favs,
      categories: mockUser.categories,
    });
  });

  it('UserService - getUser - error', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    const result = await userService.getUser('non-existent-id');
    expect(result).toBe('User not found');
  });

  describe('UserService - Create', () => {
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
    describe('UserService - Create - Error ', () => {
      it('should return a error', async () => {
        jest
          .spyOn(userService, 'createUser')
          .mockRejectedValue(
            new HttpException('Error creating user', HttpStatus.BAD_REQUEST),
          );
        try {
          await userService.createUser();
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Error creating user');
          expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }

        expect(userService.createUser).toHaveBeenCalled();
      });
    });

    describe('UserService - Create - Error 2 ', () => {
      it('should return a error', async () => {
        const mockError = new Error('Database connection error');
        jest.spyOn(prisma.user, 'create').mockRejectedValue(mockError);

        try {
          await userService.createUser();
        } catch (error) {
          expect(error).toBe(mockError);
          expect(error.message).toBe('Database connection error');
        }
        expect(prisma.user.create).toHaveBeenCalled();
      });
    });

    describe('UserService - deleteUserFavsAndCategories - Error ', () => {
      it('should return a error', async () => {
        jest
          .spyOn(userService, 'deleteUserFavsAndCategories')
          .mockRejectedValue(
            new HttpException('Error creating user', HttpStatus.BAD_REQUEST),
          );
        try {
          await userService.deleteUserFavsAndCategories(
            mockUser.user_id,
            deleteData,
          );
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Error creating user');
          expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }

        expect(userService.deleteUserFavsAndCategories).toHaveBeenCalled();
      });
    });

    describe('UserService - deleteUserFavsAndCategories', () => {
      it('should update user favs and categories when user exists', async () => {
        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

        jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

        const result = await userService.deleteUserFavsAndCategories(
          mockUser.user_id,
          deleteData,
        );
        expect(result).toEqual(updatedUser);
      });
    });

    describe('UserService - deleteUserFavsAndCategories', () => {
      it('should call a NotFoundException if user is not found', async () => {
        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

        const deleteData = { favs: ['fav1'], categories: ['cat1'] };

        await expect(
          userService.deleteUserFavsAndCategories('invalid-id', deleteData),
        ).rejects.toThrow(NotFoundException);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { user_id: 'invalid-id' },
        });
      });
    });

    describe('UserService - updateUserFavsAndCategories', () => {
      it('should throw NotFoundException if user is not found', async () => {
        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

        const updateData = { favs: ['newFav'], categories: ['newCategory'] };

        await expect(
          userService.updateUserFavsAndCategories('invalid-id', updateData),
        ).rejects.toThrow(NotFoundException);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { user_id: 'invalid-id' },
        });
      });
      it('should update favs and categories correctly for an existing user', async () => {
        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

        const updateData = {
          favs: ['3', '4'],
          categories: ['3', '4'],
        };

        jest.spyOn(prisma.user, 'update').mockResolvedValue({
          ...updatedUser,
        });

        const result = await userService.updateUserFavsAndCategories(
          '123',
          updateData,
        );

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { user_id: '123' },
        });

        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { user_id: '123' },
          data: {
            favs: ['1', '2', '3', '4'],
            categories: ['1', '2', '3', '4'],
          },
        });

        expect(result).toEqual({
          ...updatedUser,
          favs: ['2'],
          categories: ['2'],
        });
      });
    });
  });
});
