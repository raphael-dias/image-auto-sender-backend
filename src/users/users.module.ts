import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService, TestService } from './users.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UserService, TestService],
})
export class UsersModule {}
