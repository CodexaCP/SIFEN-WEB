import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';

export interface ServiceRequest {
  requestID: number;
  status: string;
  createdAt: string;
  serviceID: number;
  serviceName: string;
  price: number;
  estimatedTimeText?: string | null;
  category?: string | null;
  imageUrl?: string;
  paymentStatus?: string;
  permiteAdjunto?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  attachmentUrl?: string;
  requiresInvoice?: boolean;
  razonSocial?: string | null;
  ruc?: string | null;
  invoiceAttachmentUrl?: string | null;
}

export interface ServiceRequestAttachment {
  id: number;
  serviceRequestID: number;
  nombreArchivo?: string;
  rutaArchivo?: string;
}

export interface ServiceRequestCancellationReminder {
  reminderID: number;
  companyID: number;
  requestID: number;
  message: string;
  createdAt: string;
  isResolved: boolean;
  resolvedAt?: string | null;
}

export interface PagedResponse<T> {
  data: T[];
  totalRows: number;
}

export interface CreateServiceRequest {
  serviceID: number;
  imageUrl: string;
  requiresInvoice: boolean;
  razonSocial?: string;
  ruc?: string;
}

export interface CreateServiceRequestResponse {
  requestId: number;
}

export interface UpdateStatusRequest {
  newStatus: string;
}

export interface ValidatePaymentRequest {
  approve: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestsService {
  private baseUrl = `${environment.apiUrl}/servicerequests`;
  private uploadUrl = `${environment.apiUrl}/uploads/payment`;

  constructor(private http: HttpClient) {}

  uploadPaymentImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(this.uploadUrl, formData);
  }

  create(data: CreateServiceRequest): Observable<CreateServiceRequestResponse> {
    return this.http.post<CreateServiceRequestResponse>(this.baseUrl, data);
  }

  getAll(pageNumber: number, pageSize: number, search?: string, status?: string, paymentStatus?: string): Observable<PagedResponse<ServiceRequest>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (paymentStatus) params = params.set('paymentStatus', paymentStatus);

    return this.http.get<PagedResponse<ServiceRequest>>(this.baseUrl, { params });
  }

  getMy(pageNumber: number = 1, pageSize: number = 15, search?: string, status?: string, paymentStatus?: string): Observable<PagedResponse<ServiceRequest>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (paymentStatus) params = params.set('paymentStatus', paymentStatus);

    return this.http.get<PagedResponse<ServiceRequest> | ServiceRequest[]>(`${this.baseUrl}/my`, { params }).pipe(
      map((response) => Array.isArray(response)
        ? { data: response, totalRows: response.length }
        : response
      )
    );
  }

  updateStatus(id: number, data: UpdateStatusRequest) {
    return this.http.put(`${this.baseUrl}/${id}/status`, data);
  }

  validatePayment(id: number, data: ValidatePaymentRequest) {
    return this.http.put(`${this.baseUrl}/${id}/payment`, data);
  }

  uploadServiceAttachment(requestId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ attachmentId: number }>(`${this.baseUrl}/${requestId}/attachment`, formData);
  }

  uploadInvoiceAttachment(requestId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ invoiceUrl: string }>(`${this.baseUrl}/${requestId}/invoice`, formData);
  }

  getById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getAttachment(id: number) {
    return this.http.get<ServiceRequestAttachment>(`${this.baseUrl}/${id}/attachment`);
  }

  getCancellationReminders() {
    return this.http.get<ServiceRequestCancellationReminder[]>(`${this.baseUrl}/cancellation-reminders`);
  }

  resolveCancellationReminder(id: number) {
    return this.http.put(`${this.baseUrl}/cancellation-reminders/${id}/resolve`, {});
  }

  confirmRefund(id: number) {
    return this.http.put(`${this.baseUrl}/${id}/refund`, {});
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
