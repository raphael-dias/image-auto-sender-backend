import { Controller, Get, Query } from '@nestjs/common';
import { UserService, TestService } from './users.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userServices: UserService,
    private readonly testService: TestService,
  ) {}

  @Get()
  @ApiQuery({
    name: 'id',
    required: false,
    type: String,
    description: 'User ID (optional)',
  })
  getUser(@Query('id') id?: string): any {
    return this.userServices.getUser(id);
  }
  @Get('test')
  test() {
    return this.testService.test();
  }
}
