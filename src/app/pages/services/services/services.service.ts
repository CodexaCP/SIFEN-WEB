import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Service {
  serviceID: number;
  companyID: number;
  name: string;
  description?: string | null;
  category?: string | null;
  referenceCode: string;
  price: number;
  cost?: number | null;
  estimatedTimeText: string;
  isActive: boolean;
  createdAt: string;
  permiteAdjunto: boolean;
}

export interface CreateServiceRequest {
  name: string;
  description?: string | null;
  referenceCode: string;
  price: number;
  cost?: number | null;
  estimatedTimeText: string;
  category?: string | null;
  permiteAdjunto: boolean;
}

export interface UpdateServiceRequest extends CreateServiceRequest {
  serviceID: number;
}

export interface CreateServiceResponse {
  serviceID: number;
}

export interface PagedResponse<T> {
  data: T[];
  totalRows: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private baseUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  getAll(pageNumber: number = 1, pageSize: number = 10, search?: string, onlyActive?: boolean): Observable<PagedResponse<Service>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    if (onlyActive !== undefined && onlyActive !== null) {
      params = params.set('onlyActive', onlyActive);
    }

    return this.http.get<PagedResponse<Service>>(this.baseUrl, { params });
  }

  getAvailable(pageNumber: number = 1, pageSize: number = 100, search?: string, category?: string): Observable<PagedResponse<Service>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<PagedResponse<Service>>(`${this.baseUrl}/available`, { params });
  }

  getByCategory(category: string): Observable<Service[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<Service[]>(`${this.baseUrl}/by-category`, { params });
  }

  create(data: CreateServiceRequest): Observable<CreateServiceResponse> {
    return this.http.post<CreateServiceResponse>(this.baseUrl, data);
  }

  update(id: number, data: UpdateServiceRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  toggle(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/toggle`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/${id}`);
  }
}
