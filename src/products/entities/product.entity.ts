import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Tesla',
        description: 'Product title',
        uniqueItems: true,
    })
    @Column({
        type: 'text',
        unique: true,
    })
    title: string;

    @ApiProperty()
    @Column({
        type: 'float',
        default: 0,
    })
    price: number;

    @ApiProperty()
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty()
    @Column({
        type: 'text',
        unique: true,
    })
    slug: string;

    @ApiProperty()
    @Column({
        type: 'int',
        default: 0,
    })
    stock: number;

    @ApiProperty()
    @Column({
        type: 'text',
        array: true,
    })
    sizes: string[];

    @ApiProperty()
    @Column({
        type: 'text',
    })
    gender: string;

    @ApiProperty()
    @Column({
        type: 'text',
        array: true,
        default: [],
    })
    tags: string[];

    @ApiProperty()
    @OneToMany(() => ProductImage, (productImage) => productImage.product, {
        cascade: true,
        eager: true,
    })
    images?: ProductImage[];

    @ManyToOne(() => User, (user) => user.products, {eager: true})
    user: User;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title;
        }

        this.checkSlug();
    }

    @BeforeUpdate()
    checkSlug() {
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll(`'`, '');
    }
}
