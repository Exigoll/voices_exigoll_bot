import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: {
    email: string;
    username: string;
    password: string;
  }) {
    return this.prisma.users.create({ data });
  }
}
