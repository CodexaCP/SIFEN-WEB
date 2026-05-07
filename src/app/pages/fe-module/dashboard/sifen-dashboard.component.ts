import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/service/auth.service';
import { FeInvoiceApiService, FeInvoiceListItem, FePlanSummary } from '../services/fe-invoice-api.service';
import { SifenCompanySummary, SifenDiagnosticResult, SifenPlatformService } from '../services/sifen-platform.service';

@Component({
    selector: 'app-sifen-dashboard',
    templateUrl: './sifen-dashboard.component.html',
    styleUrls: ['./sifen-dashboard.component.scss']
})
export class SifenDashboardComponent implements OnInit {
    invoices: FeInvoiceListItem[] = [];
    companies: SifenCompanySummary[] = [];
    planSummary?: FePlanSummary;
    diagnostic?: SifenDiagnosticResult;
    loadingInvoices = false;
    loadingCompanies = false;
    errorMessage = '';

    constructor(
        private readonly authService: AuthService,
        private readonly feInvoiceApiService: FeInvoiceApiService,
        private readonly sifenPlatformService: SifenPlatformService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        if (this.activeTenantId) {
            this.loadInvoices();
            this.loadPlanSummary();
            this.loadDiagnostic();
        }

        if (this.isSuperAdmin) {
            this.loadCompanies();
        }
    }

    get displayName(): string {
        return this.authService.getSession()?.fullName || this.authService.getSession()?.displayName || 'Usuario';
    }

    get isSuperAdmin(): boolean {
        return this.sifenPlatformService.isSuperAdminRole(this.sifenPlatformService.getSessionUser()?.role);
    }

    get activeTenantId(): string | null {
        return this.sifenPlatformService.getActiveTenantId();
    }

    get canManageTenantUsers(): boolean {
        return this.sifenPlatformService.canManageTenantUsers(this.sifenPlatformService.getSessionUser());
    }

    get canConfigureTenant(): boolean {
        return this.sifenPlatformService.canConfigureTenant(this.sifenPlatformService.getSessionUser()) && !!this.activeTenantId;
    }

    get canIssueInvoices(): boolean {
        return this.sifenPlatformService.canIssueInvoices(this.sifenPlatformService.getSessionUser()) && !!this.activeTenantId;
    }

    get canViewInvoices(): boolean {
        return this.sifenPlatformService.canViewInvoices(this.sifenPlatformService.getSessionUser()) && !!this.activeTenantId;
    }

    get issuedThisMonth(): number {
        return this.invoices.length;
    }

    get validatedTestCount(): number {
        return this.countByInternalStatus('VALIDATED_TEST');
    }

    get blockedOrErrorCount(): number {
        return this.invoices.filter((invoice) => ['TEST_ERROR', 'BLOCKED_BY_CONFIG'].includes(invoice.internalStatus || 'DRAFT')).length;
    }

    get draftsCount(): number {
        return this.countByInternalStatus('DRAFT');
    }

    get generatedCount(): number {
        return this.countByInternalStatus('GENERATED');
    }

    get usagePercent(): number {
        if (!this.planSummary?.maxInvoicesPerMonth) {
            return 0;
        }

        return Math.min(100, Math.round((this.planSummary.usedInvoicesThisMonth / this.planSummary.maxInvoicesPerMonth) * 100));
    }

    get recentInvoices(): FeInvoiceListItem[] {
        return this.invoices.slice(0, 5);
    }

    get globalActiveCompanies(): number {
        return this.companies.filter((company) => this.sifenPlatformService.getStatusSeverity(company.status) === 'success').length;
    }

    get globalAlerts(): number {
        return this.companies.filter((company) => this.sifenPlatformService.getStatusSeverity(company.status) === 'danger').length;
    }

    get diagnosticStatusLabel(): string {
        return 'Operativo TEST';
    }

    get diagnosticSummaryTitle(): string {
        return this.diagnostic?.ready ? 'Todo listo!' : 'Accion requerida';
    }

    get diagnosticSummaryText(): string {
        if (!this.activeTenantId) {
            return 'No disponible todavia. Selecciona una compania o entra con un tenant resuelto.';
        }

        if (this.diagnostic?.ready) {
            return 'La configuracion actual permite operar con un flujo claro y controlado.';
        }

        return this.diagnostic?.missingItems?.[0] || 'Revisa el diagnostico antes de emitir facturas reales.';
    }

    get currentDateLabel(): string {
        return new Date().toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    get quickActions(): Array<{ label: string; route: string; icon: string; description: string }> {
        const diagnosticRoute = this.activeTenantId
            ? `/sifen/admin/companies/${this.activeTenantId}/diagnostic`
            : '/sifen/company/diagnostic';

        return [
            { label: 'Emitir factura', route: '/sifen/invoices/new', icon: 'pi pi-plus-circle', description: 'Flujo en desarrollo para emisión TEST.' },
            { label: 'Ver facturas', route: '/sifen/invoices', icon: 'pi pi-receipt', description: 'Listado operativo con filtros y paginación.' },
            { label: 'Clientes', route: '/sifen/customers', icon: 'pi pi-users', description: 'Administración comercial en construcción.' },
            { label: 'Productos', route: '/sifen/products', icon: 'pi pi-box', description: 'Catálogo aún no habilitado.' },
            { label: 'Diagnóstico', route: diagnosticRoute, icon: 'pi pi-verified', description: 'Checklist seguro por tenant.' }
        ];
    }

    openRoute(route: string): void {
        this.router.navigate([route]);
    }

    private loadInvoices(): void {
        this.loadingInvoices = true;
        this.feInvoiceApiService.getInvoices().subscribe({
            next: (invoices) => {
                this.invoices = invoices;
                this.loadingInvoices = false;
            },
            error: () => {
                this.invoices = [];
                this.loadingInvoices = false;
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
            },
            error: () => {
                this.planSummary = undefined;
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

    private loadCompanies(): void {
        this.loadingCompanies = true;
        this.sifenPlatformService.getCompanies().subscribe({
            next: (companies) => {
                this.companies = companies;
                this.loadingCompanies = false;
            },
            error: () => {
                this.companies = [];
                this.loadingCompanies = false;
            }
        });
    }

    private countByInternalStatus(status: string): number {
        return this.invoices.filter((invoice) => (invoice.internalStatus || 'DRAFT') === status).length;
    }
}
