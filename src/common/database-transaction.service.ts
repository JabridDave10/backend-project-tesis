import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner, EntityTarget, Repository, ObjectLiteral } from 'typeorm';

@Injectable()
export class DatabaseTransactionService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Ejecuta una operación dentro de una transacción
   * @param callback Función que recibe el queryRunner y debe retornar el resultado
   * @returns El resultado de la función callback
   */
  async executeInTransaction<T>(
    callback: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene el repositorio desde el queryRunner
   * @param queryRunner QueryRunner de la transacción
   * @param entity Entidad de TypeORM
   * @returns Repositorio de la entidad
   */
  getRepository<T extends ObjectLiteral>(
    queryRunner: QueryRunner,
    entity: EntityTarget<T>,
  ): Repository<T> {
    return queryRunner.manager.getRepository<T>(entity);
  }
}

