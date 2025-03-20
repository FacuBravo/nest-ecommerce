import {
    BadRequestException,
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
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

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
            this.handleErrors(error);
        }
    }

    async findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;

        return await this.productRepository.find({
            take: limit,
            skip: offset,
        });
    }

    async findOne(term: string) {
        let product: Product | null;

        if (isUUID(term)) {
            product = await this.productRepository.findOneBy({ id: term });
        } else {
            const query = this.productRepository.createQueryBuilder();
            product = await query
                .where('UPPER(title) = :title or slug = :slug', {
                    slug: term.toLocaleLowerCase(),
                    title: term.toLocaleUpperCase(),
                })
                .getOne();
        }

        if (!product) {
            throw new NotFoundException(`Product with ${term} not found`);
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        const product = await this.productRepository.preload({
            id,
            ...updateProductDto,
        });

        if (!product) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }

        try {
            await this.productRepository.save(product);
            return product;
        } catch (error) {
            this.handleErrors(error);
        }
    }

    async remove(id: string) {
        const response = await this.productRepository.delete({ id: id });

        if (!response.affected) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }
    }

    private handleErrors(error: any) {
        this.logger.error(error);

        if (error.code == 23505) {
            throw new BadRequestException(error.detail);
        }

        throw new InternalServerErrorException(error.detail);
    }
}
