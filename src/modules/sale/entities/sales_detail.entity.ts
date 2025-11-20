import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Sales } from './sales.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductBatch } from '../../products/entities/product-batch.entity';

/**
 * SalesDetail Entity
 * 
 * Detalle de una venta. Cada línea de detalle representa un producto vendido.
 * Una venta puede tener múltiples detalles (múltiples productos).
 */
@Entity('sales_detail')
export class SalesDetail {
    @PrimaryGeneratedColumn()
    id_sales_detail: number;

    @Column('int')
    id_sale: number; // Venta a la que pertenece este detalle

    @Column('int')
    id_product: number; // Producto vendido

    @Column('int', { nullable: true })
    id_batch: number; // Lote específico (si aplica control de lotes)

    @Column('decimal', { precision: 10, scale: 3 })
    quantity: number; // Cantidad vendida

    @Column('text')
    unit_type: string; // Unidad de medida (kg, litros, cajas, etc.)

    @Column('decimal', { precision: 10, scale: 2 })
    unit_price: number; // Precio unitario al momento de la venta

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    discount: number; // Descuento aplicado a esta línea

    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number; // Subtotal de esta línea (quantity * unit_price - discount)

    @Column('text', { nullable: true })
    notes: string; // Notas sobre este producto en la venta

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    modified_at: Date;

    @Column('timestamp', { nullable: true })
    deleted_at: Date;

    // ==================== RELACIONES ====================

    @ManyToOne(() => Sales, (sale) => sale.details)
    @JoinColumn({ name: 'id_sale' })
    sale: Sales;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'id_product' })
    product: Product;

    @ManyToOne(() => ProductBatch, { nullable: true })
    @JoinColumn({ name: 'id_batch' })
    batch: ProductBatch;
}