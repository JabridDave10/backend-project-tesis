import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ProductCategory } from '../../products/entities/product-category.entity';
import { Product } from '../../products/entities/product.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';
import { Sales } from '../../sale/entities/sales.entity';

@Entity('company')
export class Company {
    @PrimaryGeneratedColumn()
    id_company: number;

    @Column('text')
    name: string;

    @Column('text')
    nit: string;

    @Column('text')
    logo: string;

    @Column('int8')
    id_status: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    modified_at: Date;

    @Column('timestamp', { nullable: true })
    deleted_at: Date;

    // Relaciones con productos
    @OneToMany(() => ProductCategory, (category) => category.company)
    productCategories: ProductCategory[];

    @OneToMany(() => Product, (product) => product.company)
    products: Product[];

    // Relación con bodegas
    @OneToMany(() => Warehouse, (warehouse) => warehouse.company)
    warehouses: Warehouse[];

    // Relación con ventas
    @OneToMany(() => Sales, (sale) => sale.company)
    sales: Sales[];
}