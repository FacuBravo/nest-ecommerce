import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { Product } from 'src/products/entities';

@Injectable()
export class SeedService {
    constructor(private readonly productsService: ProductsService) {}

    async runSeed() {
        await this.insertNewProducts();
        return 'SEED EXECUTED';
    }

    private async insertNewProducts() {
        await this.productsService.deleteAllProducts();

        const products = initialData.products;
        const insertPromises: Promise<Product | undefined>[] = [];

        products.forEach((p) =>
            insertPromises.push(this.productsService.create(p)),
        );

        await Promise.all(insertPromises);

        return true;
    }
}
