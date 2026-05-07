import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FeInvoiceApiService, FeInvoiceDetail, FeInvoiceEventItem, FeInvoiceStatusResult } from '../services/fe-invoice-api.service';
import { SifenPlatformService } from '../services/sifen-platform.service';
import { SifenKudePreviewModel } from '../kude-preview/sifen-kude-preview.component';

@Component({
    selector: 'app-fe-detail',
    templateUrl: './fe-detail.component.html',
    styleUrls: ['./fe-detail.component.scss']
})
export class FeDetailComponent implements OnInit {
    invoice?: FeInvoiceDetail;
    events: FeInvoiceEventItem[] = [];
    statusSnapshot?: FeInvoiceStatusResult;
    feedbackMessage = '';
    errorMessage = '';
    loading = false;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly feInvoiceApiService: FeInvoiceApiService,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            return;
        }

        this.loading = true;
        this.feInvoiceApiService.getInvoiceById(id).subscribe({
            next: (invoice) => {
                this.invoice = invoice;
                this.loading = false;
                this.refreshStatus();
                this.refreshEvents();
            },
            error: (error) => {
                this.invoice = undefined;
                this.loading = false;
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo cargar el detalle FE.');
            }
        });
    }

    backToList(): void {
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    refreshStatus(): void {
        if (!this.invoice) {
            return;
        }

        this.feInvoiceApiService.getStatus(this.invoice.cdc).subscribe({
            next: (status) => {
                this.statusSnapshot = status;
            },
            error: (error) => {
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo consultar el estado FE.');
            }
        });
    }

    downloadXml(): void {
        if (!this.invoice) {
            return;
        }

        this.feInvoiceApiService.downloadXml(this.invoice.id).subscribe({
            next: (xml) => {
                this.downloadFile(xml.fileName, xml.content);
                this.feedbackMessage = `XML descargado para ${this.invoice?.number}.`;
            },
            error: (error) => {
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo descargar el XML.');
            }
        });
    }

    downloadKude(): void {
        if (!this.invoice) {
            return;
        }

        this.feInvoiceApiService.downloadKude(this.invoice.id).subscribe({
            next: (result) => {
                if (!result.available || !result.file) {
                    this.feedbackMessage = result.message ?? 'KuDE aun no disponible para esta factura.';
                    return;
                }

                this.downloadFile(result.file.fileName, result.file.content);
                this.feedbackMessage = `KuDE descargado para ${this.invoice?.number}.`;
            },
            error: (error) => {
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo descargar el KuDE.');
            }
        });
    }

    retry(): void {
        if (!this.invoice?.canRetry) {
            return;
        }

        this.feedbackMessage = '';
        this.errorMessage = '';
        this.feInvoiceApiService.retry(this.invoice.id).subscribe({
            next: (result) => {
                this.feedbackMessage = `Reintento registrado. Intento #${result.attemptNumber}.`;
                this.refreshDetail();
            },
            error: (error) => {
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo reintentar esta factura.');
            }
        });
    }

    prepareTest(): void {
        if (!this.invoice) {
            return;
        }

        this.feedbackMessage = '';
        this.errorMessage = '';
        this.feInvoiceApiService.prepareTest(this.invoice.id).subscribe({
            next: (result) => {
                this.feedbackMessage = result.message;
                this.refreshDetail();
            },
            error: (error) => {
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo preparar la factura en modo TEST.');
            }
        });
    }

    tagSeverity(status: FeInvoiceStatusResult['status']) {
        return this.feInvoiceApiService.getStatusSeverity(status);
    }

    statusMessage(status: FeInvoiceStatusResult['status']) {
        return this.feInvoiceApiService.getStatusShortMessage(status);
    }

    get effectiveReason(): string {
        return this.statusSnapshot?.userMessage
            || this.invoice?.userMessage
            || this.statusSnapshot?.statusMessage
            || this.invoice?.statusMessage
            || 'Sin novedades para esta factura.';
    }

    get effectiveAction(): string {
        return this.statusSnapshot?.suggestedAction
            || this.invoice?.suggestedAction
            || 'No se requiere ninguna accion por ahora.';
    }

    get effectiveCorrelationId(): string {
        return this.statusSnapshot?.correlationId
            || this.invoice?.correlationId
            || 'No disponible';
    }

    get canViewTechnicalDetails(): boolean {
        const session = this.sifenPlatformService.getSessionUser();
        return this.sifenPlatformService.canConfigureTenant(session);
    }

    get internalStatusMessage(): string {
        return this.feInvoiceApiService.getInternalStatusMessage(this.invoice?.internalStatus);
    }

    get previewModel(): SifenKudePreviewModel | null {
        if (!this.invoice) {
            return null;
        }

        return {
            businessName: 'Codexa FE TEST',
            ruc: '80000000-0',
            address: 'Asunción, Paraguay',
            phone: this.invoice.customerPhone || '+595 981 000000',
            email: this.invoice.customerEmail || 'facturacion@test.codexa',
            establishment: this.invoice.establishmentCode,
            expeditionPoint: this.invoice.expeditionPointCode,
            documentNumber: this.invoice.number,
            issueDate: this.invoice.issuedAt,
            customerName: this.invoice.customerName,
            customerDocument: this.invoice.customerDocument,
            customerAddress: this.invoice.customerAddress || 'Sin dirección cargada',
            saleCondition: this.invoice.saleCondition,
            items: this.invoice.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                vatLabel: this.toVatLabel(item.vatRate),
                subtotal: item.subtotalAmount ?? item.totalAmount ?? 0
            })),
            subtotal: this.invoice.subtotalAmount,
            vatTotal: this.invoice.totalVatAmount,
            total: this.invoice.total,
            totalInWords: `Gs. ${Math.round(this.invoice.total).toLocaleString('es-PY')} con 00/100 en entorno TEST`,
            observations: this.invoice.notes || 'Operación de prueba generada en el entorno interno SIFEN.',
            fakeCdc: this.invoice.testCdc || this.invoice.cdc
        };
    }

    private downloadFile(fileName: string, content: Blob): void {
        const url = window.URL.createObjectURL(content);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
    }

    private refreshDetail(): void {
        if (!this.invoice?.id) {
            return;
        }

        this.loading = true;
        this.feInvoiceApiService.getInvoiceById(this.invoice.id).subscribe({
            next: (invoice) => {
                this.invoice = invoice;
                this.loading = false;
                this.refreshStatus();
                this.refreshEvents();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo recargar el detalle FE.');
            }
        });
    }

    private refreshEvents(): void {
        if (!this.invoice?.id) {
            return;
        }

        this.feInvoiceApiService.getEvents(this.invoice.id).subscribe({
            next: (events) => {
                this.events = events;
            },
            error: () => {
                this.events = this.invoice?.events ?? [];
            }
        });
    }

    private toVatLabel(vatRate?: number): string {
        if (vatRate === 5) {
            return '5%';
        }

        if (vatRate === 0) {
            return 'EXENTA';
        }

        return '10%';
    }
}
