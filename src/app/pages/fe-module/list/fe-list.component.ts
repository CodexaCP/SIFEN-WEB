import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FeInvoiceApiService, FeInvoiceListItem, FePlanSummary, FeTenantInvoicePage } from '../services/fe-invoice-api.service';
import { SifenDiagnosticResult, SifenPlatformService } from '../services/sifen-platform.service';

@Component({
    selector: 'app-fe-list',
    templateUrl: './fe-list.component.html',
    styleUrls: ['./fe-list.component.scss']
})
export class FeListComponent implements OnInit {
    invoices: FeInvoiceListItem[] = [];
    feedbackMessage = '';
    errorMessage = '';
    loading = false;
    totalCount = 0;
    totalPages = 0;
    page = 1;
    pageSize = 20;
    readonly pageSizeOptions = [10, 20, 50];
    planSummary?: FePlanSummary;
    planMessage = '';
    diagnostic?: SifenDiagnosticResult;
    activeTenantId: string | null = null;
    filters = {
        customerName: '',
        status: '',
        from: '',
        to: ''
    };

    constructor(
        private readonly feInvoiceApiService: FeInvoiceApiService,
        private readonly router: Router,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    ngOnInit(): void {
        this.activeTenantId = this.sifenPlatformService.getActiveTenantId();
        if (!this.activeTenantId) {
            this.planMessage = this.sifenPlatformService.isSuperAdminRole(this.sifenPlatformService.getSessionUser()?.role)
                ? 'Falta tenant. Vuelve a Companias y entra a Operacion FE desde el detalle del tenant.'
                : 'Tu sesion no resolvio tenant. Vuelve a login.';
            return;
        }

        this.loadInvoices();
        this.loadPlanSummary();
        this.loadDiagnostic();
    }

    openIssue(): void {
        if (!this.canIssueInvoices) {
            this.errorMessage = 'Tu rol actual no puede emitir facturas.';
            return;
        }

        if (this.isReadOnlyMode) {
            this.errorMessage = 'Plan vencido';
            return;
        }

        this.router.navigate(['/sifen/invoices/new']);
    }

    openDetail(invoice: FeInvoiceListItem): void {
        this.router.navigate(['/sifen/invoices', invoice.id]);
    }

    downloadXml(invoice: FeInvoiceListItem): void {
        this.errorMessage = '';
        this.feInvoiceApiService.downloadXml(invoice.id).subscribe({
            next: (xml) => {
                this.downloadFile(xml.fileName, xml.content);
                this.feedbackMessage = `XML descargado para ${invoice.number}.`;
            },
            error: (error) => {
                this.feedbackMessage = '';
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo descargar el XML de la factura seleccionada.');
            }
        });
    }

    downloadKude(invoice: FeInvoiceListItem): void {
        this.errorMessage = '';
        this.feInvoiceApiService.downloadKude(invoice.id).subscribe({
            next: (result) => {
                if (!result.available || !result.file) {
                    this.feedbackMessage = result.message ?? 'KuDE aun no disponible para esta factura.';
                    return;
                }

                this.downloadFile(result.file.fileName, result.file.content);
                this.feedbackMessage = `KuDE descargado para ${invoice.number}.`;
            },
            error: (error) => {
                this.feedbackMessage = '';
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo descargar el KuDE de la factura seleccionada.');
            }
        });
    }

    retry(invoice: FeInvoiceListItem): void {
        if (!invoice.canRetry || this.isReadOnlyMode) {
            return;
        }

        this.feedbackMessage = '';
        this.errorMessage = '';
        this.feInvoiceApiService.retry(invoice.id).subscribe({
            next: (result) => {
                this.feedbackMessage = `Reintento registrado para ${invoice.number}. Intento #${result.attemptNumber}.`;
                this.loadInvoices();
            },
            error: (error) => {
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo reintentar la factura seleccionada.');
            }
        });
    }

    tagSeverity(status: FeInvoiceListItem['status']) {
        return this.feInvoiceApiService.getStatusSeverity(status);
    }

    internalStatusSeverity(internalStatus?: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
        switch (internalStatus) {
            case 'VALIDATED_TEST':
                return 'success';
            case 'READY_FOR_REAL':
                return 'info';
            case 'GENERATED':
                return 'info';
            case 'BLOCKED_BY_CONFIG':
                return 'warning';
            case 'TEST_ERROR':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    internalStatusLabel(internalStatus?: string): string {
        return internalStatus || 'DRAFT';
    }

    internalStatusMessage(internalStatus?: string): string {
        return this.feInvoiceApiService.getInternalStatusMessage(internalStatus);
    }

    get usagePercent(): number {
        if (!this.planSummary?.maxInvoicesPerMonth) {
            return 0;
        }

        return Math.min(100, Math.round((this.planSummary.usedInvoicesThisMonth / this.planSummary.maxInvoicesPerMonth) * 100));
    }

    get statusOptions(): Array<{ label: string; value: string }> {
        return [
            { label: 'DRAFT', value: 'DRAFT' },
            { label: 'GENERATED', value: 'GENERATED' },
            { label: 'VALIDATED_TEST', value: 'VALIDATED_TEST' },
            { label: 'TEST_ERROR', value: 'TEST_ERROR' },
            { label: 'READY_FOR_REAL', value: 'READY_FOR_REAL' },
            { label: 'BLOCKED_BY_CONFIG', value: 'BLOCKED_BY_CONFIG' }
        ];
    }

    applyFilters(): void {
        this.page = 1;
        this.loadInvoices();
    }

    clearFilters(): void {
        this.filters = {
            customerName: '',
            status: '',
            from: '',
            to: ''
        };
        this.applyFilters();
    }

    changePage(event: { first: number; rows: number }): void {
        this.pageSize = event.rows;
        this.page = Math.floor(event.first / event.rows) + 1;
        this.loadInvoices();
    }

    get invoiceUsageLabel(): string {
        if (!this.planSummary) {
            return '--';
        }

        return this.planSummary.maxInvoicesPerMonth
            ? `${this.planSummary.usedInvoicesThisMonth} / ${this.planSummary.maxInvoicesPerMonth}`
            : `${this.planSummary.usedInvoicesThisMonth} / sin limite`;
    }

    get usersLabel(): string {
        if (!this.planSummary) {
            return '--';
        }

        if (this.planSummary.usersUsed == null) {
            return this.planSummary.maxUsers ? `limite ${this.planSummary.maxUsers}` : 'sin limite';
        }

        return this.planSummary.maxUsers
            ? `${this.planSummary.usersUsed} / ${this.planSummary.maxUsers}`
            : `${this.planSummary.usersUsed} / sin limite`;
    }

    get isReadOnlyMode(): boolean {
        return this.planSummary?.active === false;
    }

    get canIssueInvoices(): boolean {
        return this.sifenPlatformService.canIssueInvoices(this.sifenPlatformService.getSessionUser());
    }

    private loadInvoices(): void {
        if (!this.activeTenantId) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.feInvoiceApiService.getTenantInvoices({
            tenantId: this.activeTenantId,
            status: this.filters.status || undefined,
            customerName: this.filters.customerName,
            from: this.filters.from,
            to: this.filters.to,
            page: this.page,
            pageSize: this.pageSize
        }).subscribe({
            next: (result: FeTenantInvoicePage) => {
                this.invoices = result.items;
                this.totalCount = result.totalCount;
                this.totalPages = result.totalPages;
                this.page = result.page;
                this.pageSize = result.pageSize;
                this.loading = false;
            },
            error: (error) => {
                this.invoices = [];
                this.loading = false;
                this.errorMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo cargar el listado FE.');
            }
        });
    }

    private loadPlanSummary(): void {
        if (!this.activeTenantId) {
            return;
        }

        this.feInvoiceApiService.getPlanSummary(this.activeTenantId).subscribe({
            next: (summary) => {
                this.planSummary = summary;
                this.planMessage = summary.active
                    ? (summary.usersMessage ?? '')
                    : 'Plan vencido';
            },
            error: (error) => {
                this.planSummary = undefined;
                this.planMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo cargar el plan FE del tenant.');
            }
        });
    }

    private loadDiagnostic(): void {
        if (!this.activeTenantId) {
            return;
        }

        this.sifenPlatformService.getDiagnostic(this.activeTenantId).subscribe({
            next: (diagnostic) => {
                this.diagnostic = diagnostic;
            },
            error: () => {
                this.diagnostic = undefined;
            }
        });
    }

    private downloadFile(fileName: string, content: Blob): void {
        const url = window.URL.createObjectURL(content);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
    }
}
