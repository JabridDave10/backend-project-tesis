import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { DatabaseTransactionService } from '../../common/database-transaction.service';

@Injectable()
export class CompanyService {
  constructor(
    private databaseTransactionService: DatabaseTransactionService,
  ) {}

  async create(companyData: CreateCompanyDto): Promise<Company> {
    return await this.databaseTransactionService.executeInTransaction(
      async (queryRunner: QueryRunner) => {
        let companyResult: Company;
        
        // Check if company already exists (by NIT) - only if NIT is provided
        let existingCompany: Company | null = null;
        if (companyData.nit) {
          const companyRepository = this.databaseTransactionService.getRepository(
            queryRunner,
            Company,
          );
          
          existingCompany = await companyRepository
            .createQueryBuilder('company')
            .where('company.nit = :nit', { nit: companyData.nit })
            .andWhere('company.deleted_at IS NULL')
            .getOne();
        }

        if (existingCompany) {
          // Update existing company
          const companyRepository = this.databaseTransactionService.getRepository(
            queryRunner,
            Company,
          );
          
          await companyRepository
            .createQueryBuilder()
            .update()
            .set({
              name: companyData.name,
              logo: companyData.logo || undefined,
              modified_at: new Date(),
            })
            .where('id_company = :id', { id: existingCompany.id_company })
            .execute();

          // Get updated company
          const updatedCompany = await companyRepository
            .createQueryBuilder('company')
            .where('company.id_company = :id', { id: existingCompany.id_company })
            .getOne();
          
          if (!updatedCompany) {
            throw new Error('Error al actualizar empresa');
          }
          companyResult = updatedCompany;
        } else {
          // Create new company
          const companyRepository = this.databaseTransactionService.getRepository(
            queryRunner,
            Company,
          );
          
          const newCompany = companyRepository.create({
            name: companyData.name,
            nit: companyData.nit,
            logo: companyData.logo || undefined,
            id_status: 1, // Default status
            created_at: new Date(),
          });

          companyResult = await companyRepository.save(newCompany);
        }

        return companyResult;
      },
    );
  }
}
