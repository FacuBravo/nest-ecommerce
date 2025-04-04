import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const validRoles = this.reflector.get<string[]>(
            ROLES_KEY,
            context.getHandler(),
        );

        if (!validRoles) return true;
        if (validRoles.length === 0) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user as User;

        for (const role of user.roles) {
            if (validRoles.includes(role)) {
                return true;
            }
        }

        throw new ForbiddenException(`User ${user.fullName} need a valid role`);
    }
}
