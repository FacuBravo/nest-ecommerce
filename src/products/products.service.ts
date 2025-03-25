import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DataSource, Repository } from 'typeorm';
import { Product, ProductImage } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger('ProductsService');

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ProductImage)
        private readonly productImageRepository: Repository<ProductImage>,
        private readonly dataSource: DataSource,
    ) {}

    async create(createProductDto: CreateProductDto) {
        try {
            const { images = [], ...productDetails } = createProductDto;

            const product = this.productRepository.create({
                ...productDetails,
                images: images.map((image) =>
                    this.productImageRepository.create({ url: image }),
                ),
            });

            await this.productRepository.save(product);
            return product;
        } catch (error) {
            this.handleErrors(error);
        }
    }

    async findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;

        const products = await this.productRepository.find({
            take: limit,
            skip: offset,
            relations: {
                images: true,
            },
        });

        return products.map(({ images, ...rest }) => ({
            ...rest,
            images: images?.map((i) => i.url) || [],
        }));
    }

    private async findOne(term: string) {
        let product: Product | null;

        if (isUUID(term)) {
            product = await this.productRepository.findOneBy({ id: term });
        } else {
            const query = this.productRepository.createQueryBuilder('p');
            product = await query
                .where('UPPER(title) = :title or slug = :slug', {
                    slug: term.toLocaleLowerCase(),
                    title: term.toLocaleUpperCase(),
                })
                .leftJoinAndSelect('p.images', 'pImgs')
                .getOne();
        }

        if (!product) {
            throw new NotFoundException(`Product with ${term} not found`);
        }

        return product;
    }

    async findOnePlain(term: string) {
        const { images = [], ...rest } = await this.findOne(term);

        return {
            ...rest,
            images: images.map((img) => img.url),
        };
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        const { images, ...toUpdate } = updateProductDto;

        const product = await this.productRepository.preload({
            id,
            ...toUpdate,
        });

        if (!product) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (images) {
                await queryRunner.manager.delete(ProductImage, { product: id });
                product.images = images.map((img) =>
                    this.productImageRepository.create({ url: img }),
                );
            }

            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();

            return this.findOnePlain(id);
        } catch (error) {
            queryRunner.rollbackTransaction();
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

    async deleteAllProducts() {
        try {
            await this.productRepository.delete({})
            return 'All products deleted'
        } catch (error) {
            this.handleErrors(error)
        }
    }
}
