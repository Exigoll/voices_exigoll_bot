import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly logger: Logger
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Invalid token");
    }

    try {
      const payload = this.jwt.verify(token);
      request.userId = payload.userId;
    } catch (err) {
      this.logger.error(err.message);
      throw new UnauthorizedException("Invalid token");
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    return request.headers.authorization?.split(" ")[1];
  }
}
