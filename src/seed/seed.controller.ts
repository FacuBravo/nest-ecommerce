import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ValidRoles } from '../auth/interfaces/valid-roles.enum';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) {}

    @Get()
    @Auth(ValidRoles.admin, ValidRoles.superUser)
    runSeed() {
        return this.seedService.runSeed();
    }
}
