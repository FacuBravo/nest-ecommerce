import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger('ProductsService');

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async create(createProductDto: CreateProductDto) {
        try {
            const product = this.productRepository.create(createProductDto);
            await this.productRepository.save(product);
            return product;
        } catch (error) {
            this.logger.error(error);
            throw new InternalServerErrorException();
        }
    }

    async findAll() {
        return await this.productRepository.find();
    }

    async findOne(id: string) {
        const product = await this.productRepository.findOneBy({ id: id });

        if (!product) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }

        return product;
    }

    update(id: string, updateProductDto: UpdateProductDto) {
        return `This action updates a #${id} product`;
    }

    async remove(id: string) {
        const response = await this.productRepository.delete({ id: id });

        if (!response.affected) {
            throw new NotFoundException(`Product with id ${id} not found`)
        }
    }
}
