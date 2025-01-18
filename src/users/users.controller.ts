import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './users.service';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userServices: UserService) {}

  @Get()
  getUser(@Query('id') id: string): any {
    return this.userServices.getUser(id);
  }
  @Get('create')
  createUser() {
    return this.userServices.createUser();
  }

  @Delete('favs/:id')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiBody({
    description: 'Delete user favorites and categories',
    examples: {
      example1: {
        summary: 'Delete specific favs and categories',
        value: {
          favs: ['1', '2'],
          categories: ['1'],
        },
      },
    },
  })
  async deleteUserFavsAndCategories(
    @Param('id') id: string,
    @Body() deleteData: UpdateUserDto,
  ): Promise<any> {
    return this.userServices.deleteUserFavsAndCategories(id, deleteData);
  }

  @Patch('favs/:id')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiBody({
    description: 'Update user favorites and categories by adding new items',
    examples: {
      example1: {
        summary: 'Add new favs and categories',
        value: {
          favs: ['1', '2'],
          categories: ['1', '2'],
        },
      },
    },
  })
  async updateUserFavsAndCategories(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
  ): Promise<any> {
    return this.userServices.updateUserFavsAndCategories(id, updateData);
  }

  @Get('test')
  test() {
    return 'SUCCESS';
  }
}
