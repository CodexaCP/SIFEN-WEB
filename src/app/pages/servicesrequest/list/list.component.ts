import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { AuthService } from '@core/service/auth.service';
import { ServiceRequestsService, ServiceRequest } from '../services/servicesrequest.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  requests: ServiceRequest[] = [];
  loading = false;
  totalRows = 0;
  pageNumber = 1;
  pageSize = 15;
  search = '';
  status?: string;
  paymentStatus?: string;
  isCustomer = false;
  paymentStatusOptions = [
    { label: 'Todos los pagos', value: null },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Pendiente de devolucion', value: 'PENDIENTE_DEVOLUCION' },
    { label: 'Validado', value: 'VALIDADO' },
    { label: 'Reintegrado', value: 'REINTEGRADO' },
    { label: 'Rechazado', value: 'RECHAZADO' },
    { label: 'Cancelado', value: 'CANCELADO' }
  ];

  constructor(
    private service: ServiceRequestsService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.isCustomer = this.authService.isRole('CUSTOMER');
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;

    const request$ = this.isCustomer
      ? this.service.getMy(this.pageNumber, this.pageSize, this.search, this.status, this.paymentStatus)
      : this.service.getAll(this.pageNumber, this.pageSize, this.search, this.status, this.paymentStatus);

    request$.subscribe({
      next: (res) => {
        this.requests = res.data || [];
        this.totalRows = res.totalRows;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudieron cargar las solicitudes',
          detail: 'Verifica la conexion con la API e intenta nuevamente.'
        });
      }
    });
  }

  onLazyLoad(event: LazyLoadEvent) {
    this.pageSize = event.rows ?? 15;
    this.pageNumber = ((event.first ?? 0) / this.pageSize) + 1;
    this.loadRequests();
  }

  onSearch(event: Event) {
    this.search = (event.target as HTMLInputElement).value;
    this.pageNumber = 1;
    this.loadRequests();
  }

  clear() {
    this.search = '';
    this.status = undefined;
    this.paymentStatus = undefined;
    this.pageNumber = 1;
    this.loadRequests();
  }

  onPaymentStatusChange(value: string | null) {
    this.paymentStatus = value || undefined;
    this.pageNumber = 1;
    this.loadRequests();
  }

  goCreate() {
    this.router.navigate(['/dashboard/servicesrequest/create']);
  }

  openRequest(r: ServiceRequest) {
    this.router.navigate(['/dashboard/servicesrequest', r.requestID]);
  }

  formatPrice(value?: number | null): string {
    return new Intl.NumberFormat('es-PY', { maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'SOLICITADO': return 'warning';
      case 'EN_PROCESO': return 'info';
      case 'FINALIZADO': return 'success';
      case 'CANCELADO_PAGO': return 'danger';
      case 'CANCELADO_USUARIO': return 'danger';
      default: return 'secondary';
    }
  }

  statusClass(status: string) {
    switch (status) {
      case 'FINALIZADO': return 'done';
      case 'EN_PROCESO': return 'progress';
      case 'CANCELADO_PAGO':
      case 'CANCELADO_USUARIO': return 'danger';
      default: return 'pending';
    }
  }

  paymentClass(status?: string) {
    switch (status) {
      case 'VALIDADO': return 'done';
      case 'REINTEGRADO': return 'done';
      case 'PENDIENTE_DEVOLUCION': return 'danger';
      case 'RECHAZADO': return 'danger';
      default: return 'pending';
    }
  }

}

