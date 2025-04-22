import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";

import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService
  ) {}

  // Генерация JWT и REFRESH токенов
  async generateUserTokens(userId: number) {
    const accessToken = this.jwt.sign({ userId });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);

    return { accessToken, refreshToken };
  }

  // Сохранение REFRESH токена
  async storeRefreshToken(token: string, userId: number) {
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.refreshToken.upsert({
      where: {
        userId
      },
      update: {
        token,
        expiresAt: expiryDate
      },
      create: {
        token,
        expiresAt: expiryDate,
        user: {
          connect: {
            id: userId
          }
        }
      }
    });
  }

  // Проверка REFRESH токена
  async validateRefreshToken(refreshToken: string) {
    const token = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        expiresAt: { gte: new Date() }
      }
    });

    if (!token) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
