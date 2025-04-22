import { Module } from "@nestjs/common";

import { AuthModule } from "@/modules/auth/auth.module";
import { EmailModule } from "@/modules/email/email.module";
import { PasswordController } from "@/modules/password/password.controller";
import { UsersModule } from "@/modules/users/users.module";

import { PasswordService } from "./password.service";

@Module({
  imports: [AuthModule, EmailModule, UsersModule],
  controllers: [PasswordController],
  providers: [PasswordService],
  exports: [PasswordService]
})
export class PasswordModule {}
