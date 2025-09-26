import axios, { AxiosInstance } from 'axios';
import { User, Company, Country, Branch, Role } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://us-central1-harachi-erp.cloudfunctions.net/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Companies
  async getCompanies(harachiId: string) {
    const response = await this.api.get('/companies', { data: { harachiId } });
    return response.data;
  }

  async createCompany(companyData: Partial<Company>) {
    const response = await this.api.post('/companies', companyData);
    return response.data;
  }

  async getCompanyById(id: string) {
    const response = await this.api.get(`/companies/${id}`);
    return response.data;
  }

  async updateCompany(id: string, companyData: Partial<Company>) {
    const response = await this.api.put(`/companies/${id}`, companyData);
    return response.data;
  }

  async deleteCompany(id: string) {
    const response = await this.api.delete(`/companies/${id}`);
    return response.data;
  }

  // Countries
  async getCountries(companyId: string) {
    const response = await this.api.get(`/companies/${companyId}/countries`);
    return response.data;
  }

  async createCountry(companyId: string, countryData: Partial<Country>) {
    const response = await this.api.post(`/companies/${companyId}/countries`, countryData);
    return response.data;
  }

  // Branches
  async getBranches(countryId: string) {
    const response = await this.api.get(`/countries/${countryId}/branches`);
    return response.data;
  }

  async createBranch(countryId: string, branchData: Partial<Branch>) {
    const response = await this.api.post(`/countries/${countryId}/branches`, branchData);
    return response.data;
  }

  // Users
  async getUsers(companyId: string) {
    const response = await this.api.get(`/companies/${companyId}/users`);
    return response.data;
  }

  async createUser(companyId: string, userData: any) {
    const response = await this.api.post(`/companies/${companyId}/users`, userData);
    return response.data;
  }

  // Roles
  async getRoles(companyId: string) {
    const response = await this.api.get(`/companies/${companyId}/roles`);
    return response.data;
  }

  async createRole(companyId: string, roleData: Partial<Role>) {
    const response = await this.api.post(`/companies/${companyId}/roles`, roleData);
    return response.data;
  }
}

export const apiService = new ApiService();
