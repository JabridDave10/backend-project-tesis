import { Company } from 'src/modules/company/entities/company.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Stock } from '../../products/entities/stock.entity';
import { StockMovement } from '../../products/entities/stock-movement.entity';
import { ProductBatch } from '../../products/entities/product-batch.entity';

@Entity('warehouse')
export class Warehouse {
    @PrimaryGeneratedColumn()
    id_warehouse: number;

    @Column('text')
    address: string;

    @Column('int8')
    id_company: number;

    @Column('int8')
    id_status: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    modified_at: Date;

    @Column('timestamp', { nullable: true })
    deleted_at: Date;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({ name: 'id_company' })
    company: Company;

    @OneToMany(() => Stock, (stock) => stock.warehouse)
    stocks: Stock[];

    @OneToMany(() => StockMovement, (movement) => movement.warehouseOrigin)
    stockMovementsOrigin: StockMovement[];

    @OneToMany(() => StockMovement, (movement) => movement.warehouseDestination)
    stockMovementsDestination: StockMovement[];

    @OneToMany(() => ProductBatch, (batch) => batch.warehouse)
    batches: ProductBatch[];
}