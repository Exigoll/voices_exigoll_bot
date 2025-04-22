import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { hash, verify } from "argon2";

import { LoginDto } from "@/modules/auth/dto/login.dto";
import { RefreshTokenDto } from "@/modules/auth/dto/refresh-token.dto";
import { RegisterDto } from "@/modules/auth/dto/register.dto";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { TokensService } from "@/modules/tokens/tokens.service";
import { UsersService } from "@/modules/users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokensService,
    private readonly prisma: PrismaService
  ) {}

  // Register
  async register(dto: RegisterDto) {
    const { username, email, password } = dto;
    const hashPassword = await hash(password);

    // Проверка уникальности email
    const emailExists = await this.prisma.users.findUnique({
      where: { email }
    });

    if (emailExists) {
      throw new BadRequestException("Email already exists");
    }

    await this.users.createUser({
      email,
      username,
      password: hashPassword
    });

    return {
      message: "User successfully registered"
    };
  }

  // Login
  async login(dto: LoginDto) {
    // Find if user exists by email
    const { email, password } = dto;
    const user = await this.prisma.users.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException("Wrong credentials");
    }

    // Check password
    const passwordMatch = await verify(user.password, password);

    if (!passwordMatch) {
      throw new UnauthorizedException("Wrong credentials");
    }

    // Generate tokens
    const tokens = await this.tokens.generateUserTokens(user.id);

    return {
      ...tokens,
      userId: user.id
    };
  }

  // Обновление токена
  async refreshTokens(dto: RefreshTokenDto) {
    const { refreshToken } = dto;
    const token = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        expiresAt: { gte: new Date() }
      }
    });

    if (!token) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return this.tokens.generateUserTokens(token.userId);
  }

  // logout
  async logout(refreshToken: string) {
    const token = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken
      }
    });

    if (!token) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    await this.prisma.refreshToken.delete({
      where: {
        id: token.id
      }
    });

    return { message: "Successfully logged out" };
  }
}
