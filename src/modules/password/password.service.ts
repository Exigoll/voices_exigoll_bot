import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { hash, verify } from "argon2";
import { nanoid } from "nanoid";

import { EmailService } from "@/modules/email/email.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class PasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService
  ) {}

  // Change password
  async changePassword(userId: number, password: string, newPassword: string) {
    // Find if user exists
    const user = await this.prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check password
    const passwordMatch = await verify(user.password, password);

    if (!passwordMatch) {
      throw new UnauthorizedException("Wrong credentials");
    }

    // Хэшируем новый пароль
    const newHashPassword = await hash(newPassword);

    // Обновляем пароль в БД
    await this.prisma.users.update({
      where: { id: userId },
      data: { password: newHashPassword }
    });

    return { message: "Password successfully changed" };
  }

  // Forgot password
  async forgotPassword(email: string) {
    // Check that user exists
    const user = await this.prisma.users.findUnique({ where: { email } });

    if (user) {
      // If user exists, generate password reset link
      const resetToken = nanoid(64);

      await this.prisma.resetToken.upsert({
        where: {
          userId: user.id // Поиск токена для данного пользователя
        },
        update: {
          token: resetToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        },
        create: {
          token: resetToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      });

      // Send the link to the user by email
      this.email.sendPasswordResetEmail(email, resetToken);
    }

    return { message: "If this user exists, they will receive an email" };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    // Find a valid reset token document
    const token = await this.prisma.resetToken.findFirst({
      where: {
        token: resetToken,
        expiresAt: { gte: new Date() }
      }
    });

    if (!token) {
      throw new UnauthorizedException("Invalid link");
    }

    // Change user password (MAKE SURE TO HASH BEFORE SAVING)
    const user = await this.prisma.users.findUnique({
      where: { id: token.userId }
    });

    if (!user) {
      throw new InternalServerErrorException();
    }

    // Hush the new password
    const hashPassword = await hash(newPassword);

    // Update user's password in the DB
    await this.prisma.users.update({
      where: { id: user.id },
      data: { password: hashPassword }
    });

    // Optionally, delete the used reset token
    await this.prisma.resetToken.delete({
      where: { id: token.id }
    });

    return { message: "Password successfully changed" };
  }
}
