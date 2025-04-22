import { Body, Controller, Post, Put, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation
} from "@nestjs/swagger";

import { ChangePasswordDto } from "@/modules/password/dto/change-password.dto";
import { ForgotPasswordDto } from "@/modules/password/dto/forgot-password.dto";
import { ResetPasswordDto } from "@/modules/password/dto/reset-password.dto";

import { AuthGuard } from "@/guards/auth.guard";

import { CurrentUser } from "@/decorators/current-user";

import { PasswordService } from "./password.service";

//@UseGuards(AuthGuard)
@Controller("password")
export class PasswordController {
  constructor(private readonly password: PasswordService) {}

  // Метод обновления пароля
  @ApiOperation({ summary: "Change password" })
  @ApiCreatedResponse({
    description: "Password successfully changed",
    type: ChangePasswordDto
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put("change-password")
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser("userId") userId: number
  ) {
    return this.password.changePassword(userId, dto.password, dto.newPassword);
  }

  // Метод восстановления пароля
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.password.forgotPassword(dto.email);
  }

  // Метод сброса пароля
  @Put("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.password.resetPassword(dto.newPassword, dto.resetToken);
  }
}
