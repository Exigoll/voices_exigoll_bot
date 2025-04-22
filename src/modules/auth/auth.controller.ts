import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";

import { LoginDto } from "@/modules/auth/dto/login.dto";
import { RefreshTokenDto } from "@/modules/auth/dto/refresh-token.dto";
import { RegisterDto } from "@/modules/auth/dto/register.dto";

import { AuthGuard } from "@/guards/auth.guard";

import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Метод регистрации
  @ApiOperation({ summary: "Registration users" })
  @ApiCreatedResponse({
    description: "User successfully registered",
    type: RegisterDto
  })
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  // Метод логина
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // Метод обновления токена
  @Post("refresh")
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.auth.refreshTokens(dto);
  }

  // Метод выхода
  @UseGuards(AuthGuard)
  @Post("logout")
  async logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refreshToken);
  }
}
