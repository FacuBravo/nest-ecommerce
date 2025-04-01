import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles.enum';

export const ROLES_KEY = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => SetMetadata(ROLES_KEY, args);
