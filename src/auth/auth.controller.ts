import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { GetRawHeaders } from './decorators/get-raw-headers.decorator';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from './interfaces/valid-roles.enum';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.authService.create(createUserDto);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Get('check-auth-status')
    @Auth()
    checkAuthStatus(@GetUser() user: User) {
        return this.authService.checkAuthStatus(user);
    }

    @Get()
    @Auth(ValidRoles.admin, ValidRoles.superUser)
    privateRoute(
        @GetUser() user: User,
        @GetUser('email') userEmail: string,
        @GetRawHeaders() rawHeaders: string[],
    ) {
        return { user, userEmail, rawHeaders };
    }
}
