import { WarehouseService } from "./warehouse.service";
import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { AuthGuard } from "../auth/auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
// import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
@Controller('warehouse')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

//   @Post('create')
//   async createWarehouse(@Body() body: any, @Res() response: Response) {
//     try {
//       const warehouseData = plainToClass(CreateWarehouseDto, body);
//       const errors = await validate(warehouseData);
//     }
//   }
}