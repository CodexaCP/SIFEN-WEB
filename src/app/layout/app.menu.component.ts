import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        const role = this.authService.getSession()?.role ?? '';
        const canManageUsers = ['SUPER_ADMIN', 'ADMIN_GENERAL', 'GESTOR_SUPREMO', 'GESTOR'].includes(role);
        const canManageServices = ['SUPER_ADMIN', 'ADMIN_GENERAL', 'GESTOR_SUPREMO'].includes(role);
        const canViewAudit = ['SUPER_ADMIN', 'ADMIN_GENERAL'].includes(role);
        const canViewDiagnostics = ['SUPER_ADMIN'].includes(role);

        this.model = [
            {
                label: 'Panel',
                items: [
                    { label: 'Resumen', icon: 'pi pi-home', routerLink: ['/dashboard'] },
                    { label: 'Solicitudes', icon: 'pi pi-inbox', routerLink: ['/dashboard/servicesrequest'] }
                ]
            }
        ];

        if (canManageUsers || canManageServices) {
            const items = [];

            if (canManageUsers) {
                items.push({ label: 'Usuarios', icon: 'pi pi-users', routerLink: ['/dashboard/customers'] });
            }

            if (canManageServices) {
                items.push({ label: 'Servicios', icon: 'pi pi-briefcase', routerLink: ['/dashboard/services'] });
            }

            this.model.push({
                label: 'Operacion',
                items
            });
        }

        if (canViewAudit || canViewDiagnostics) {
            const items = [];

            if (canViewAudit) {
                items.push({ label: 'Auditoría', icon: 'pi pi-history', routerLink: ['/dashboard/audit'] });
            }

            if (canViewDiagnostics) {
                items.push({ label: 'Diagnóstico', icon: 'pi pi-heart', routerLink: ['/dashboard/system-diagnostics'] });
            }

            this.model.push({
                label: 'Control',
                items
            });
        }
    }
}
