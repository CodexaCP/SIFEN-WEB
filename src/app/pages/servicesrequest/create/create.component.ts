import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ServiceRequestsService } from '../services/servicesrequest.service';
import { ServicesService, Service } from 'src/app/pages/services/services/services.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  services: Service[] = [];
  selectedServiceId?: number;
  selectedService?: Service;
  selectedFile?: File;
  selectedFileName = '';
  loadingUpload = false;
  loadingSave = false;
  loadingServices = false;
  attachmentFile?: File;
  requiresInvoice = false;
  razonSocial = '';
  ruc = '';

  constructor(
    private serviceRequestsService: ServiceRequestsService,
    private servicesService: ServicesService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(search?: string) {
    this.loadingServices = true;

    this.servicesService.getAvailable(1, 100, search).subscribe({
      next: (res: any) => {
        this.services = (res.data || []).filter((service: Service) => service.isActive !== false);
        this.loadingServices = false;
      },
      error: (error) => {
        this.loadingServices = false;
        this.showError('No se pudieron cargar los servicios', this.extractErrorMessage(error, 'Intenta nuevamente en unos segundos.'));
      }
    });
  }

  onServiceFilter(event: any) {
    this.loadServices(event?.filter || '');
  }

  onServiceChange(serviceId: number) {
    if (!serviceId) {
      this.selectedService = undefined;
      this.selectedServiceId = undefined;
      return;
    }

    this.selectedServiceId = serviceId;
    this.selectedService = this.services.find((service) => service.serviceID === serviceId);
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!allowed.includes(file.type)) {
      this.showWarn('Formato no permitido', 'Selecciona una imagen JPG o PNG para el comprobante.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.showWarn('Archivo muy grande', 'El comprobante no puede superar 10MB.');
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  formatPrice(value?: number | null): string {
    return new Intl.NumberFormat('es-PY', { maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  async uploadImage(): Promise<string> {
    if (!this.selectedFile) {
      throw new Error('No file');
    }

    this.loadingUpload = true;

    try {
      const res = await firstValueFrom(this.serviceRequestsService.uploadPaymentImage(this.selectedFile));
      this.loadingUpload = false;
      return res.imageUrl;
    } catch (error) {
      this.loadingUpload = false;
      throw new Error(this.extractErrorMessage(error, 'Error al subir comprobante'));
    }
  }

  async submit() {
    if (!this.selectedServiceId) {
      this.showWarn('Servicio requerido', 'Selecciona el servicio que deseas solicitar.');
      return;
    }

    if (!this.selectedFile) {
      this.showWarn('Comprobante requerido', 'Adjunta la imagen de tu transferencia para continuar.');
      return;
    }

    if (this.requiresInvoice && (!this.razonSocial.trim() || !this.ruc.trim())) {
      this.showWarn('Factura incompleta', 'Si requieres factura, debes informar razon social y RUC.');
      return;
    }

    try {
      this.loadingSave = true;
      const imageUrl = await this.uploadImage();
      const response = await firstValueFrom(
        this.serviceRequestsService.create({
          serviceID: this.selectedServiceId,
          imageUrl,
          requiresInvoice: this.requiresInvoice,
          razonSocial: this.requiresInvoice ? this.razonSocial.trim() : undefined,
          ruc: this.requiresInvoice ? this.ruc.trim() : undefined
        })
      );

      const requestId = response.requestId;

      if (this.selectedService?.permiteAdjunto && this.attachmentFile) {
        await firstValueFrom(this.serviceRequestsService.uploadServiceAttachment(requestId, this.attachmentFile));
      }

      this.loadingSave = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Solicitud creada',
        detail: 'Tu solicitud fue registrada correctamente y el pago quedo pendiente de validacion.'
      });
      setTimeout(() => this.router.navigate(['/dashboard/servicesrequest']), 700);
    } catch (error) {
      this.loadingSave = false;
      this.showError('No se pudo crear la solicitud', this.extractErrorMessage(error, 'Revisa los datos e intenta nuevamente.'));
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/servicesrequest']);
  }

  onAttachmentSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.showWarn('Archivo muy grande', 'El adjunto no puede superar 10MB.');
      return;
    }

    this.attachmentFile = file;
  }

  private showWarn(summary: string, detail: string) {
    this.messageService.add({ severity: 'warn', summary, detail });
  }

  private showError(summary: string, detail: string) {
    this.messageService.add({ severity: 'error', summary, detail });
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    const httpError = error as HttpErrorResponse;
    const apiError = httpError?.error;

    if (typeof apiError === 'string' && apiError) {
      return apiError;
    }

    return apiError?.error?.message || apiError?.message || httpError?.message || fallback;
  }
}
