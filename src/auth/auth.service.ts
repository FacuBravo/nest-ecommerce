import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    private readonly logger = new Logger('AuthService');

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async create(createUserDto: CreateUserDto) {
        try {
            const { password, ...userData } = createUserDto;
            const user = this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10),
            });

            await this.userRepository.save(user);

            return {
                ...user,
                token: this.createJwt({ id: user.id }),
            };
        } catch (error) {
            this.handleErrors(error);
        }
    }

    async login(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;

        const user = await this.userRepository.findOne({
            where: { email },
            select: { email: true, password: true, id: true },
        });

        if (!user) {
            throw new UnauthorizedException(`Invalid Credentials (email)`);
        }

        if (!bcrypt.compareSync(password, user.password)) {
            throw new UnauthorizedException(`Invalid Credentials (password)`);
        }

        return { ...user, token: this.createJwt({ id: user.id }) };
    }

    async checkAuthStatus(user: User) {
        return { ...user, token: this.createJwt({ id: user.id }) };
    }

    private createJwt(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }

    private handleErrors(error: any): never {
        this.logger.error(error);

        if (error.code == 23505) {
            throw new BadRequestException(error.detail);
        }

        throw new InternalServerErrorException(error.detail);
    }
}
