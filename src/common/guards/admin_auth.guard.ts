import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ErrorMessage } from '../constants/error.message';

@Injectable()
export class JwtAdminAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
    
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      
      if (payload?.role?.toLowerCase() !== 'admin') {
        throw new UnauthorizedException('Admin role required');
      }

   
      req.user = { userId: payload.sub, role: payload.role };
      return true;
    } catch (e) {
      throw  ErrorMessage.errorMessage(e?.message ,400 , 1000);
    }
  }

  
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw ErrorMessage.auth.unAuthorized;
    }
    return user;
  }
}