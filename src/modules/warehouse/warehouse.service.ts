import { DatabaseTransactionService } from "src/common/database-transaction.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class WarehouseService {
  constructor(
    private databaseTransactionService: DatabaseTransactionService,
  ) {}
}