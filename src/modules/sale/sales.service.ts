import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { Sales } from './entities/sales.entity';
import { SalesDetail } from './entities/sales_detail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { DatabaseTransactionService } from '../../common/database-transaction.service';

@Injectable()
export class SalesService {
  constructor(
    private databaseTransactionService: DatabaseTransactionService,
  ) {}

  async create(saleData: CreateSaleDto): Promise<Sales> {
    return await this.databaseTransactionService.executeInTransaction(
      async (queryRunner: QueryRunner) => {
        const salesRepository = this.databaseTransactionService.getRepository(
          queryRunner,
          Sales,
        );
        const salesDetailRepository = this.databaseTransactionService.getRepository(
          queryRunner,
          SalesDetail,
        );

        // Generar número de venta si no se proporciona
        let saleNumber = saleData.sale_number;
        if (!saleNumber) {
          const currentYear = new Date().getFullYear();
          const lastSale = await salesRepository
            .createQueryBuilder('sale')
            .where('sale.sale_number LIKE :pattern', { pattern: `VTA-${currentYear}-%` })
            .andWhere('sale.deleted_at IS NULL')
            .orderBy('sale.sale_number', 'DESC')
            .getOne();

          let nextNumber = 1;
          if (lastSale && lastSale.sale_number) {
            const lastNumber = parseInt(lastSale.sale_number.split('-')[2] || '0');
            nextNumber = lastNumber + 1;
          }
          saleNumber = `VTA-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
        }

        // Crear la venta
        const saleInsertResult = await salesRepository
          .createQueryBuilder()
          .insert()
          .into(Sales)
          .values({
            sale_number: saleNumber,
            id_client: saleData.id_client,
            id_company: saleData.id_company,
            id_user: saleData.id_user,
            id_route: saleData.id_route || undefined,
            subtotal: saleData.subtotal,
            discount: saleData.discount || 0,
            tax: saleData.tax || 0,
            total: saleData.total,
            status: saleData.status || 'pendiente',
            payment_method: saleData.payment_method || undefined,
            payment_status: saleData.payment_status || undefined,
            notes: saleData.notes || undefined,
          })
          .returning('*')
          .execute();

        const savedSaleId = saleInsertResult.identifiers[0]?.id_sale;

        // Crear los detalles
        const detailsToInsert = saleData.details.map((detail) => ({
          id_sale: savedSaleId,
          id_product: detail.id_product,
          id_batch: detail.id_batch || undefined,
          quantity: detail.quantity,
          unit_type: detail.unit_type,
          unit_price: detail.unit_price,
          discount: detail.discount || 0,
          subtotal: detail.subtotal,
          notes: detail.notes || undefined,
        }));

        await salesDetailRepository
          .createQueryBuilder()
          .insert()
          .into(SalesDetail)
          .values(detailsToInsert)
          .execute();

        // Retornar la venta con detalles
        const saleWithDetails = await salesRepository
          .createQueryBuilder('sale')
          .leftJoinAndSelect('sale.details', 'details')
          .leftJoinAndSelect('details.product', 'product')
          .leftJoinAndSelect('sale.client', 'client')
          .leftJoinAndSelect('sale.company', 'company')
          .leftJoinAndSelect('sale.user', 'user')
          .where('sale.id_sale = :id', { id: savedSaleId })
          .getOne();

        return saleWithDetails || saleInsertResult.raw[0];
      },
    );
  }

  async getAll(): Promise<Sales[]> {
    return await this.databaseTransactionService.executeInTransaction(
      async (queryRunner: QueryRunner) => {
        const salesRepository = this.databaseTransactionService.getRepository(
          queryRunner,
          Sales,
        );
        const sales = await salesRepository.find();
        return sales;
      },
    );
  }
}
