import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule as NestJwtModule } from "@nestjs/jwt";

import { configJwt } from "@/config/jwt.config";

@Module({
  imports: [
    NestJwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: configJwt,
      global: true
    })
  ],
  exports: [NestJwtModule]
})
export class JwtModule {}
