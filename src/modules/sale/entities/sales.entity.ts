import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Clients } from '../../clients/entities/clients.entity';
import { Company } from '../../company/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { Route } from '../../routes/entities/route.entity';
import { SalesDetail } from './sales_detail.entity';

/**
 * Sales Entity
 * 
 * Entidad principal de ventas. Representa una venta completa con toda su información.
 */
@Entity('sales')
export class Sales {
    @PrimaryGeneratedColumn()
    id_sale: number;

    @Column('text', { unique: true })
    sale_number: string; // Número único de venta (ej: "VTA-2025-001")

    @Column('int')
    id_client: number; // Cliente que realiza la compra

    @Column('int')
    id_company: number; // Compañía a la que pertenece la venta

    @Column('int')
    id_user: number; // Usuario/vendedor que creó la venta

    @Column('int', { nullable: true })
    id_route: number; // Ruta asociada (si la venta requiere entrega)

    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number; // Subtotal antes de impuestos y descuentos

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    discount: number; // Descuento total aplicado

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    tax: number; // Impuestos

    @Column('decimal', { precision: 10, scale: 2 })
    total: number; // Total final de la venta

    @Column('text', { default: 'pendiente' })
    status: string; // pendiente, confirmada, en_proceso, completada, cancelada

    @Column('text', { nullable: true })
    payment_method: string; // Método de pago (efectivo, tarjeta, transferencia, etc.)

    @Column('text', { nullable: true })
    payment_status: string; // Estado del pago (pendiente, pagado, parcial, cancelado)

    @Column('text', { nullable: true })
    notes: string; // Notas adicionales sobre la venta

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    modified_at: Date;

    @Column('timestamp', { nullable: true })
    deleted_at: Date;

    // ==================== RELACIONES ====================

    @ManyToOne(() => Clients)
    @JoinColumn({ name: 'id_client' })
    client: Clients;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'id_company' })
    company: Company;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_user' })
    user: User;

    @ManyToOne(() => Route, { nullable: true })
    @JoinColumn({ name: 'id_route' })
    route: Route;

    @OneToMany(() => SalesDetail, (detail) => detail.sale)
    details: SalesDetail[];
}