import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { Clients } from './entities/clients.entity';
import { DatabaseTransactionService } from '../../common/database-transaction.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private databaseTransactionService: DatabaseTransactionService,
  ) {}

  async create(clientData: CreateClientDto): Promise<Clients> {
    return await this.databaseTransactionService.executeInTransaction(
      async (queryRunner: QueryRunner) => {
        let clientResult: Clients;
        
        // Check if client already exists (by identification) - only if identification is provided
        let existingClient: Clients | null = null;
        if (clientData.identification) {
          const clientRepository = this.databaseTransactionService.getRepository(
            queryRunner,
            Clients,
          );
          
          existingClient = await clientRepository
            .createQueryBuilder('client')
            .where('client.identification = :identification', { identification: clientData.identification })
            .andWhere('client.deleted_at IS NULL')
            .getOne();
        }

        if (existingClient) {
          // Update existing company
          const clientRepository = this.databaseTransactionService.getRepository(
            queryRunner,
            Clients,
          );
          
          await clientRepository
            .createQueryBuilder()
            .update()
            .set({
              name: clientData.name,
              identification: clientData.identification,
              email: clientData.email,
              phone: clientData.phone,
              address: clientData.address,
              modified_at: new Date(),
            })
            .where('id_client = :id', { id: existingClient.id_client })
            .execute();

          // Get updated company
          const updatedClient = await clientRepository
            .createQueryBuilder('client')
            .where('client.id_client = :id', { id: existingClient.id_client })
            .getOne();
          
          if (!updatedClient) {
            throw new Error('Error al actualizar empresa');
          }
          clientResult = updatedClient;
        } else {
          // Create new company
          const clientRepository = this.databaseTransactionService.getRepository(
            queryRunner,
            Clients,
          );
          
          const newClient = clientRepository.create({
            name: clientData.name,
            identification: clientData.identification,
            email: clientData.email,
            phone: clientData.phone,
            address: clientData.address,
            created_at: new Date()
          });

          clientResult = await clientRepository.save(newClient);
        }

        return clientResult;
      },
    );
  }

  async getAll(): Promise<Clients[]> {
    return await this.databaseTransactionService.executeInTransaction(
      async (queryRunner: QueryRunner) => {
        const clientRepository = this.databaseTransactionService.getRepository(
          queryRunner,
          Clients,
        );
        return await clientRepository.find();
      },
    );
  }
}
