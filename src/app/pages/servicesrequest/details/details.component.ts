import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceRequestsService } from '../services/servicesrequest.service';
import { firstValueFrom } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '@core/service/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class DetailsComponent implements OnInit {

  requestId!: number;
  request?: any;

  loading = false;
  canDelete = false;
  isCustomer = false;
  canManagePayment = false;
  canManageRefund = false;
  canManageStatus = false;
  invoiceFile?: File;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ServiceRequestsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    this.canDelete = this.authService.isRole('SUPER_ADMIN');
    this.isCustomer = this.authService.isRole('CUSTOMER');
    this.canManagePayment = this.authService.isRole('SUPER_ADMIN', 'ADMIN_GENERAL', 'GESTOR_SUPREMO');
    this.canManageRefund = this.authService.isRole('SUPER_ADMIN', 'ADMIN_GENERAL', 'GESTOR_SUPREMO', 'GESTOR');
    this.canManageStatus = this.authService.isRole('SUPER_ADMIN', 'ADMIN_GENERAL', 'GESTOR_SUPREMO');
    this.load();
  }

  // =========================
  // 🔄 LOAD
  // =========================
  async load() {
    this.loading = true;

    try {
      this.request = await firstValueFrom(
        this.service.getById(this.requestId)
      );

      if (this.request && !this.request.attachmentUrl) {
        try {
          const attachment = await firstValueFrom(this.service.getAttachment(this.requestId));
          this.request.attachmentUrl = attachment?.rutaArchivo;
        } catch {
          // Some requests do not have optional attachments.
        }
      }
    } catch (err: any) {
      console.error(err);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la solicitud'
      });
    } finally {
      this.loading = false;
    }
  }

  // =========================
  // 💳 VALIDAR PAGO
  // =========================
  async validatePayment(approve: boolean) {
    try {
      await firstValueFrom(
        this.service.validatePayment(this.requestId, { approve })
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Pago',
        detail: approve ? 'Pago aprobado correctamente' : 'Pago rechazado'
      });

      this.load();

    } catch (err: any) {
      console.error(err);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.error?.message || 'Error validando pago'
      });
    }
  }

  // =========================
  // 🔄 CAMBIAR ESTADO
  // =========================
  async changeStatus(status: string) {
    try {

      await firstValueFrom(
        this.service.updateStatus(this.requestId, { newStatus: status })
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Estado',
        detail: status === 'CANCELADO_USUARIO'
          ? `Tu solicitud N. ${this.requestId} ha sido cancelada correctamente. El reintegro del 100% sera procesado en un plazo maximo de 48 horas. Si no lo recibes, contacta con soporte indicando tu nombre completo y numero de solicitud.`
          : `Solicitud actualizada a ${status}`
      });

      this.load();

    } catch (err: any) {
      console.error(err);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.error?.message || 'Error actualizando estado'
      });
    }
  }

  canCancelRequest(): boolean {
    return this.isCustomer && this.normalizeStatus(this.request?.status) === 'SOLICITADO';
  }

  canManagePendingPayment(): boolean {
    return this.canManagePayment
      && this.normalizeStatus(this.request?.paymentStatus) === 'PENDIENTE'
      && this.normalizeStatus(this.request?.status) !== 'CANCELADO_USUARIO';
  }

  canConfirmRefund(): boolean {
    return this.canManageRefund
      && this.normalizeStatus(this.request?.status) === 'CANCELADO_USUARIO'
      && this.normalizeStatus(this.request?.paymentStatus) === 'PENDIENTE_DEVOLUCION';
  }

  async confirmRefund() {
    try {
      await firstValueFrom(this.service.confirmRefund(this.requestId));
      this.messageService.add({
        severity: 'success',
        summary: 'Reintegro confirmado',
        detail: `La solicitud N. ${this.requestId} ahora figura como reintegrada.`
      });
      this.load();
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.error?.message || 'No se pudo confirmar el reintegro'
      });
    }
  }

  confirmCancelRequest() {
    this.confirmationService.confirm({
      header: 'Cancelar solicitud',
      message: 'La solicitud sera cancelada y no podra continuar el proceso actual.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar solicitud',
      rejectLabel: 'Volver',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.changeStatus('CANCELADO_USUARIO')
    });
  }

  // =========================
  // 🎨 UI STATUS
  // =========================
  formatPrice(value?: number | null): string {
    return new Intl.NumberFormat('es-PY', { maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  onInvoiceSelect(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const extension = `.${(file.name.split('.').pop() || '').toLowerCase()}`;
    if (!allowedExtensions.includes(extension)) {
      this.messageService.add({ severity: 'warn', summary: 'Formato no permitido', detail: 'La factura debe ser PDF, JPG o PNG.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.messageService.add({ severity: 'warn', summary: 'Archivo muy grande', detail: 'La factura no puede superar 10MB.' });
      return;
    }
    this.invoiceFile = file;
  }

  async uploadInvoice() {
    if (!this.invoiceFile) return;
    try {
      const res: any = await firstValueFrom(this.service.uploadInvoiceAttachment(this.requestId, this.invoiceFile));
      this.request.invoiceAttachmentUrl = res?.invoiceUrl || this.request.invoiceAttachmentUrl;
      this.messageService.add({ severity: 'success', summary: 'Factura adjunta', detail: 'La factura fue adjuntada correctamente.' });
      this.invoiceFile = undefined;
      await this.load();
    } catch (err: any) {
      this.messageService.add({ severity: 'error', summary: 'No se pudo adjuntar la factura', detail: err?.error?.message || 'Intenta nuevamente.' });
    }
  }

  canUploadInvoice(): boolean {
    return this.canManageStatus && this.normalizeStatus(this.request?.status) === 'EN_PROCESO' && !!this.request?.requiresInvoice && !this.hasFile(this.request?.invoiceAttachmentUrl);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'SOLICITADO': return 'bg-blue-100 text-blue-700';
      case 'PAGO_VALIDADO': return 'bg-green-100 text-green-700';
      case 'EN_PROCESO': return 'bg-yellow-100 text-yellow-700';
      case 'FINALIZADO': return 'bg-purple-100 text-purple-700';
      case 'CANCELADO_USUARIO':
      case 'CANCELADO_PAGO': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  paymentDisplayStatus(): string {
    switch (this.normalizeStatus(this.request?.paymentStatus)) {
      case 'PENDIENTE_DEVOLUCION': return 'Pendiente de devolucion';
      case 'REINTEGRADO': return 'Reintegrado';
      default: return this.request?.paymentStatus || 'PENDIENTE';
    }
  }

  finalStatusMessage(): string {
    return this.normalizeStatus(this.request?.status) === 'FINALIZADO'
      ? 'TramiYa: tu tramite fue finalizado con exito. Todo esta listo. Esperamos verte pronto!'
      : '';
  }

  resolveFileUrl(url?: string): string {
    if (!url) {
      return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `${environment.serverUrl}${url.startsWith('/') ? url : `/${url}`}`;
  }

  getFileName(url?: string): string {
    if (!url) {
      return 'Archivo adjunto';
    }

    const clean = url.split('?')[0];
    const fileName = clean.substring(clean.lastIndexOf('/') + 1);
    return decodeURIComponent(fileName || 'Archivo adjunto');
  }

  hasFile(url?: string): boolean {
    return !!this.resolveFileUrl(url);
  }

  openFile(url?: string): void {
    const resolvedUrl = this.resolveFileUrl(url);

    if (!resolvedUrl) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Archivo no disponible',
        detail: 'No se encontro el archivo solicitado.'
      });
      return;
    }

    window.open(resolvedUrl, '_blank', 'noopener');
  }

  private normalizeStatus(status?: string): string {
    return (status || '').trim().toUpperCase();
  }

  confirmDelete() {
    this.confirmationService.confirm({
      header: 'Eliminar solicitud',
      message: 'Solo el admin supremo puede eliminar solicitudes. Esta accion no se puede deshacer.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete()
    });
  }

  private async delete() {
    try {
      await firstValueFrom(this.service.delete(this.requestId));
      this.messageService.add({
        severity: 'success',
        summary: 'Solicitud eliminada',
        detail: 'La solicitud fue eliminada correctamente.'
      });
      setTimeout(() => this.goBack(), 600);
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'No se pudo eliminar',
        detail: err?.error?.error?.message || err?.error?.message || 'Intenta nuevamente.'
      });
    }
  }

  // =========================
  // 🔙 NAV
  // =========================
  goBack() {
    this.router.navigate(['/dashboard/servicesrequest']);
  }
}




