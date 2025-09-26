import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async createCompany(data: {
    harachiId: string;
    name: string;
    code: string;
  }) {
    const schemaName = `company_${data.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    return this.prisma.company.create({
      data: {
        ...data,
        schemaName,
      },
    });
  }

  async getCompanies(harachiId: string) {
    return this.prisma.company.findMany({
      where: { harachiId, isActive: true },
      include: {
        countries: true,
        _count: {
          select: {
            users: true,
            countries: true,
          },
        },
      },
    });
  }

  async getCompanyById(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        countries: {
          include: {
            branches: true,
          },
        },
        users: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async updateCompany(id: string, data: any) {
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async deleteCompany(id: string) {
    return this.prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
