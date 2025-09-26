import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  createCompany(@Body() createCompanyDto: any) {
    return this.companiesService.createCompany(createCompanyDto);
  }

  @Get()
  getCompanies(@Body() body: { harachiId: string }) {
    return this.companiesService.getCompanies(body.harachiId);
  }

  @Get(':id')
  getCompanyById(@Param('id') id: string) {
    return this.companiesService.getCompanyById(id);
  }

  @Put(':id')
  updateCompany(@Param('id') id: string, @Body() updateCompanyDto: any) {
    return this.companiesService.updateCompany(id, updateCompanyDto);
  }

  @Delete(':id')
  deleteCompany(@Param('id') id: string) {
    return this.companiesService.deleteCompany(id);
  }
}
