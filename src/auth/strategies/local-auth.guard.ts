// src/auth/guards/local-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
class LocalAuthGuard extends AuthGuard('local') {
  constructor(private readonly role: 'user' | 'admin') {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.body.role = this.role;
    return super.canActivate(context);
  }
}

// Factory function – bu to‘g‘ri ishlaydi!
export const LocalUserGuard = () => new LocalAuthGuard('user');
export const LocalAdminGuard = () => new LocalAuthGuard('admin');