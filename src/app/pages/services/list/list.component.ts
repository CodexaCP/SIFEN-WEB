import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ServicesService, Service } from '../services/services.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  services: Service[] = [];
  loading: boolean = false;

  // 🔹 backend pagination
  totalRows: number = 0;
  pageNumber: number = 1;
  pageSize: number = 15;

  // 🔹 filtros
  search: string = '';
  onlyActive?: boolean;

  constructor(
    private servicesService: ServicesService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  /* =========================
     LOAD DATA
  ========================= */
  loadServices(): void {
    this.loading = true;

    this.servicesService.getAll(
      this.pageNumber,
      this.pageSize,
      this.search,
      this.onlyActive
    ).subscribe({
      next: (res) => {
        this.services = res.data;
        this.totalRows = res.totalRows;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading services', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudieron cargar los servicios',
          detail: 'Verifica la conexion con la API e intenta nuevamente.'
        });
      }
    });
  }

  /* =========================
     LAZY PAGINATION
  ========================= */
  onLazyLoad(event: any) {
  this.pageSize = event.rows ?? 15;
  this.pageNumber = ((event.first ?? 0) / this.pageSize) + 1;

  this.loadServices();
}

  /* =========================
     FILTERS
  ========================= */
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.search = value;
    this.pageNumber = 1;

    this.loadServices();
  }

  clear() {
    this.search = '';
    this.onlyActive = undefined;
    this.pageNumber = 1;

    this.loadServices();
  }

  /* =========================
     ACTIONS
  ========================= */
  goCreate() {
    this.router.navigate(['/dashboard/services/create']);
  }

  openService(service: Service) {
    this.router.navigate(['/dashboard/services', service.serviceID]);
  }

  toggle(service: Service) {
    this.servicesService.toggle(service.serviceID).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: service.isActive ? 'Servicio inactivado' : 'Servicio activado',
          detail: 'El catalogo fue actualizado correctamente.'
        });
        this.loadServices();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo actualizar el servicio',
          detail: 'Intenta nuevamente o revisa tus permisos.'
        });
      }
    });
  }
}
