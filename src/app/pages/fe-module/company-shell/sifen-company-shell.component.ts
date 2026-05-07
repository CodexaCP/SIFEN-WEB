import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/service/auth.service';
import { SifenPlatformService } from '../services/sifen-platform.service';

interface SifenNavItem {
    label: string;
    route: string;
    icon: string;
    visible: boolean;
    accent?: 'primary' | 'soft';
}

@Component({
    selector: 'app-sifen-company-shell',
    templateUrl: './sifen-company-shell.component.html',
    styleUrls: ['./sifen-company-shell.component.scss']
})
export class SifenCompanyShellComponent {
    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    get displayName(): string {
        return this.authService.getSession()?.fullName || this.authService.getSession()?.displayName || 'Usuario';
    }

    get companyLabel(): string {
        const session = this.authService.getSession() as any;
        return session?.companyName || session?.businessName || (this.activeTenantId ? `Tenant ${this.activeTenantId}` : 'Sin compania activa');
    }

    get isSuperAdmin(): boolean {
        return this.sifenPlatformService.isSuperAdminRole(this.authService.getSession()?.role);
    }

    get activeTenantId(): string | null {
        return this.sifenPlatformService.getActiveTenantId();
    }

    get canManageTenantUsers(): boolean {
        return this.sifenPlatformService.canManageTenantUsers(this.authService.getSession());
    }

    get canConfigureTenant(): boolean {
        return this.sifenPlatformService.canConfigureTenant(this.authService.getSession()) && !!this.activeTenantId;
    }

    get canViewInvoices(): boolean {
        return this.sifenPlatformService.canViewInvoices(this.authService.getSession()) && !!this.activeTenantId;
    }

    get navItems(): SifenNavItem[] {
        const diagnosticRoute = this.activeTenantId
            ? `/sifen/admin/companies/${this.activeTenantId}/diagnostic`
            : '/sifen/company/diagnostic';

        const items: SifenNavItem[] = [
            { label: 'Dashboard', route: '/sifen/dashboard', icon: 'pi pi-th-large', visible: true, accent: 'primary' },
            { label: 'Emitir factura', route: '/sifen/invoices/new', icon: 'pi pi-plus-circle', visible: this.sifenPlatformService.canIssueInvoices(this.authService.getSession()) && !!this.activeTenantId, accent: 'primary' },
            { label: 'Facturas', route: '/sifen/invoices', icon: 'pi pi-receipt', visible: this.canViewInvoices },
            { label: 'Clientes', route: '/sifen/customers', icon: 'pi pi-users', visible: !!this.activeTenantId },
            { label: 'Productos / Servicios', route: '/sifen/products', icon: 'pi pi-box', visible: !!this.activeTenantId },
            { label: 'Notas de crédito', route: '/sifen/credit-notes', icon: 'pi pi-file-edit', visible: !!this.activeTenantId },
            { label: 'Plantillas KuDE', route: '/sifen/kude-templates', icon: 'pi pi-image', visible: !!this.activeTenantId },
            { label: 'Configuración SIFEN', route: '/sifen/configuration', icon: 'pi pi-cog', visible: !!this.activeTenantId },
            { label: 'Diagnóstico', route: diagnosticRoute, icon: 'pi pi-verified', visible: this.canConfigureTenant || this.isSuperAdmin || !!this.activeTenantId },
            { label: 'Integración API', route: '/sifen/api-integration', icon: 'pi pi-code', visible: !!this.activeTenantId },
            { label: 'Reportes', route: '/sifen/reports', icon: 'pi pi-chart-line', visible: !!this.activeTenantId },
            { label: 'Compañías', route: '/sifen/admin/companies', icon: 'pi pi-building', visible: this.isSuperAdmin, accent: 'soft' }
        ];

        return items.filter((item) => item.visible);
    }

    openHelp(): void {
        this.router.navigate(['/sifen/help']);
    }

    openNotifications(): void {
        this.router.navigate(['/sifen/dashboard']);
    }

    logout(): void {
        this.sifenPlatformService.clearSelectedTenant();
        this.authService.logout();
        this.router.navigate(['/sifen/login']);
    }
}
