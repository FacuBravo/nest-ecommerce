import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductsModule } from 'src/products/products.module';
import { Product } from 'src/products/entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [SeedController],
    providers: [SeedService],
    imports: [ProductsModule, Product, AuthModule],
})
export class SeedModule {}
