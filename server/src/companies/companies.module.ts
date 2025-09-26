import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CompaniesService, PrismaService],
  controllers: [CompaniesController],
  exports: [CompaniesService],
})
export class CompaniesModule {}
