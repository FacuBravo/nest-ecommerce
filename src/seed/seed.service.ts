import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { Product } from 'src/products/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
    constructor(
        private readonly productsService: ProductsService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async runSeed() {
        await this.dropDb();
        const user = await this.createUsers();
        await this.insertNewProducts(user);
        return 'SEED EXECUTED';
    }

    private async dropDb() {
        await this.productsService.deleteAllProducts();
        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder.delete().where({}).execute();
    }

    private async createUsers() {
        const seedUsers = initialData.users;
        const users: User[] = [];

        seedUsers.forEach((user) => {
            user.password = bcrypt.hashSync(user.password, 10)
            users.push(this.userRepository.create(user));
        });

        const createdUsers = await this.userRepository.save(users);

        return createdUsers[0];
    }

    private async insertNewProducts(user: User) {
        const products = initialData.products;
        const insertPromises: Promise<Product | undefined>[] = [];

        products.forEach((p) =>
            insertPromises.push(this.productsService.create(p, user)),
        );

        await Promise.all(insertPromises);

        return true;
    }
}
