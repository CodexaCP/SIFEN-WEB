import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService, Service } from '../services/services.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '@core/service/auth.service';
import { SERVICE_CATEGORY_OPTIONS, normalizeServiceCategory } from '../services/service-categories';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class DetailsComponent implements OnInit {

  service: Service = {} as Service;
  loading = false;
  saving = false;
  id!: number;
  canDelete = false;
  readonly categoryOptions = SERVICE_CATEGORY_OPTIONS;

  constructor(
    private route: ActivatedRoute,
    private serviceApi: ServicesService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.canDelete = this.authService.isRole('SUPER_ADMIN', 'ADMIN_GENERAL');
    this.load();
  }

  /* =========================
     LOAD
  ========================= */
  load() {
    this.loading = true;

    this.serviceApi.getById(this.id).subscribe({
      next: (res) => {
        this.service = res;
        this.service.category = normalizeServiceCategory(this.service.category);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showError('Error cargando servicio');
      }
    });
  }

  /* =========================
     HELPERS
  ========================= */
  toNumber(value: any): number {
    return value ? Number(value) : 0;
  }

  private isValid(): boolean {

    if (!this.service.name || this.service.name.trim() === '') {
      this.showWarn('Nombre requerido');
      return false;
    }

    if (!this.service.referenceCode || this.service.referenceCode.trim() === '') {
      this.showWarn('Codigo requerido');
      return false;
    }

    if (!this.service.price || this.service.price <= 0) {
      this.showWarn('Precio debe ser mayor a 0');
      return false;
    }

    if (this.service.cost && this.service.cost > this.service.price) {
      this.showWarn('El costo no puede ser mayor al precio');
      return false;
    }

    if (!this.service.estimatedTimeText || this.service.estimatedTimeText.trim() === '') {
      this.showWarn('Tiempo estimado requerido');
      return false;
    }

    if (!this.service.category || this.service.category.trim() === '') {
      this.showWarn('Categoria requerida');
      return false;
    }

    return true;
  }

  /* =========================
     SAVE
  ========================= */
  save() {

    if (!this.isValid()) return;

    const payload = {
      serviceID: this.id,
      name: this.service.name?.trim(),
      description: this.service.description?.trim(),
      referenceCode: this.service.referenceCode?.trim(),
      price: Number(this.service.price),
      cost: Number(this.service.cost),
      estimatedTimeText: this.service.estimatedTimeText?.trim(),
      category: this.service.category,
      permiteAdjunto: !!this.service.permiteAdjunto
    };

    this.saving = true;

    this.serviceApi.update(this.id, payload).subscribe({
      next: () => {
        this.saving = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'Servicio actualizado correctamente'
        });
      },
      error: () => {
        this.saving = false;
        this.showError('Error al actualizar servicio');
      }
    });
  }

  /* =========================
     TOGGLE STATUS
  ========================= */
  toggleStatus() {
    this.serviceApi.toggle(this.id).subscribe({
      next: () => {
        this.service.isActive = !this.service.isActive;

        this.messageService.add({
          severity: 'success',
          summary: 'Estado actualizado',
          detail: this.service.isActive ? 'Servicio activado' : 'Servicio desactivado'
        });
      },
      error: () => {
        this.showError('Error al cambiar estado');
      }
    });
  }

  confirmDelete() {
    this.confirmationService.confirm({
      header: 'Eliminar servicio',
      message: 'Esta accion eliminara el servicio del catalogo. Las solicitudes ya creadas se conservan.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete()
    });
  }

  private delete() {
    this.serviceApi.delete(this.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Servicio eliminado',
          detail: 'El servicio fue retirado del catalogo.'
        });
        setTimeout(() => this.back(), 600);
      },
      error: (error) => {
        this.showError(error?.error?.error?.message || error?.error?.message || 'No se pudo eliminar el servicio');
      }
    });
  }

  /* =========================
     MENSAJES
  ========================= */
  private showError(msg: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: msg
    });
  }

  private showWarn(msg: string) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validacion',
      detail: msg
    });
  }

  /* =========================
     NAV
  ========================= */
  back() {
    this.router.navigate(['/dashboard/services']);
  }
}

