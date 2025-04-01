import { Product } from 'src/products/entities';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text',
        unique: true,
    })
    email: string;

    @Column({
        type: 'text',
        select: false,
    })
    password: string;

    @Column({
        type: 'text',
    })
    fullName: string;

    @Column({
        type: 'bool',
        default: true,
    })
    isActive: boolean;

    @Column({
        type: 'text',
        array: true,
        default: ['user'],
    })
    roles: string[];

    @OneToMany(
        () => Product,
        (product) => product.user
    )
    products: Product[]

    @BeforeInsert()
    @BeforeUpdate()
    private checkBeforeInsert() {
        this.email = this.email.toLocaleLowerCase().trim()
    }
}
