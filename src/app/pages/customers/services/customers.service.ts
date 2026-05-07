import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PortalUser {
  userID: number;
  companyID: number;
  companyName: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CompanyOption {
  companyID: number;
  companyName: string;
}

export interface InternalRegisterUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roleName: string;
  companyId?: number | null;
}

export interface PagedResponse<T> {
  data: T[];
  totalRows: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getAll(search?: string, role?: string, onlyActive?: boolean | null): Observable<PagedResponse<PortalUser>> {
    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }

    if (role) {
      params = params.set('role', role);
    }

    if (onlyActive !== null && onlyActive !== undefined) {
      params = params.set('onlyActive', onlyActive);
    }

    return this.http.get<PagedResponse<PortalUser>>(`${this.baseUrl}/users`, { params });
  }

  getById(id: number): Observable<PortalUser> {
    return this.http.get<PortalUser>(`${this.baseUrl}/users/${id}`);
  }

  create(data: InternalRegisterUserRequest) {
    return this.http.post(`${this.baseUrl}/register/internal`, data);
  }

  inactivate(id: number) {
    return this.http.patch(`${this.baseUrl}/users/${id}/toggle`, {});
  }

  getCompanies(): Observable<CompanyOption[]> {
    return this.http.get<CompanyOption[]>(`${this.baseUrl}/companies`);
  }
}
