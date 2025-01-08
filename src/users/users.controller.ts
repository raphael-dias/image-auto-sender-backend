import { Controller, Get } from '@nestjs/common';
import { UserService, TestService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userServices: UserService,
    private readonly testService: TestService,
  ) {}

  @Get()
  getUser(): any {
    return this.userServices.getUser();
  }
  @Get('test')
  test() {
    return this.testService.test();
  }
}
