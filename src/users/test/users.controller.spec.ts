import { Test } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UserService } from '../users.service';
import { UserDto } from '../user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

const id = 1;
const user_id = '62860345-4488-42c4-9c8b-4289f4273660';
const public_key = `-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----`;
const private_key = `-----BEGIN ENCRYPTED PRIVATE KEY----- ... -----END ENCRYPTED PRIVATE KEY-----`;
const created_at = '2025-01-08 16:03:51.556';
const favs = ['1', '2', '3'];
const categories = ['1', '2'];

describe('UserController', () => {
  let controller: UsersController;
  let userService: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn().mockResolvedValue([
              {
                id: id,
                user_id: user_id,
                public_key: public_key,
                private_key: private_key,
                created_at: created_at,
                favs: favs,
                categories: categories,
              },
            ]),

            createUser: jest
              .fn<Promise<Partial<UserDto>>, [any]>()
              .mockImplementation(() =>
                Promise.resolve({
                  user_id: user_id,
                  public_key: public_key,
                }),
              ),

            updateUserFavsAndCategories: jest
              .fn<Promise<Partial<UserDto>>, [string, { favs: string[] }]>()
              .mockImplementation((user_id: string, { favs: newFavs }) => {
                const updatedFavs = [...favs, ...newFavs];

                return Promise.resolve({
                  user_id,
                  favs: updatedFavs,
                });
              }),

            deleteUserFavsAndCategories: jest
              .fn<Promise<Partial<UserDto>>, [string, { favs: string[] }]>()
              .mockImplementation((user_id: string, { favs: favsToRemove }) => {
                const updatedFavs = favs.filter(
                  (fav) => !favsToRemove.includes(fav),
                );

                return Promise.resolve({
                  user_id,
                  favs: updatedFavs,
                });
              }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UserService>(UserService);
  });

  describe('UserController', () => {
    it('should be defined', () => {
      expect(controller.createUser).toBeDefined();
    });
  });

  describe('UserController - getUser', () => {
    it('should get a user by id', async () => {
      const result = await controller.getUser(user_id);
      expect(result).toEqual([
        {
          id: id,
          user_id: user_id,
          public_key: public_key,
          private_key: private_key,
          created_at: created_at,
          favs: favs,
          categories: categories,
        },
      ]);
    });
  });
  describe('UserController - getUser - Error', () => {
    it('should return a error', async () => {
      jest
        .spyOn(userService, 'getUser')
        .mockRejectedValue(
          new HttpException('Error creating user', HttpStatus.BAD_REQUEST),
        );
      try {
        await controller.getUser('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Error creating user');
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }

      expect(userService.getUser).toHaveBeenCalled();
    });
  });
  describe('UserController - createUser', () => {
    it('should create a new user', async () => {
      const result = await controller.createUser();
      expect(result).toEqual({
        user_id: user_id,
        public_key: public_key,
      });
    });
  });
  describe('UserController - updateUserFavsAndCategories', () => {
    it('should update a user favs and categories', async () => {
      const result = await controller.updateUserFavsAndCategories(user_id, {
        favs: ['4'],
      });
      expect(result).toEqual({
        user_id: user_id,
        favs: ['1', '2', '3', '4'],
      });
    });
  });
  describe('UserController - deleteUserFavsAndCategories', () => {
    it('should remove a favorite from the user favs', async () => {
      const result = await controller.deleteUserFavsAndCategories(user_id, {
        favs: ['1'],
      });
      expect(result).toEqual({
        user_id: user_id,
        favs: ['2', '3'],
      });
    });
  });
});
