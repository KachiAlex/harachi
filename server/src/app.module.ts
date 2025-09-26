import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, CompaniesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
