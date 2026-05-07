import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, LoginResponse } from '@core/service/auth.service';
import { SifenPlatformService } from '../services/sifen-platform.service';

@Component({
    selector: 'app-fe-login',
    templateUrl: './fe-login.component.html',
    styleUrls: ['./fe-login.component.scss']
})
export class FeLoginComponent implements OnInit {
    loginData = {
        username: 'admin@sifen.local',
        password: ''
    };

    loading = false;
    errorMessage = '';
    private returnUrl = '/sifen';

    constructor(
        private readonly authService: AuthService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    ngOnInit(): void {
        console.log('SIFEN LOGIN INIT');

        if (this.authService.getToken() && !this.authService.isLogged()) {
            this.authService.logout();
        }

        this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/sifen/dashboard';
    }

    login(): void {
        if (this.loading) {
            return;
        }

        if (!this.loginData.username || !this.loginData.password) {
            this.errorMessage = 'Completa usuario y contrasena.';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.authService.login(this.loginData).subscribe({
            next: (response) => this.handleAuthSuccess(response),
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.extractErrorMessage(error);
            }
        });
    }

    private handleAuthSuccess(response: LoginResponse): void {
        this.authService.saveToken(response.token);
        this.authService.setPendingPasswordChange(response.mustChangePassword);
        this.authService.saveDisplayName(this.loginData.username);

        if (response.mustChangePassword) {
            this.loading = false;
            this.errorMessage = 'Tu usuario requiere cambio de contrasena inicial. Usa el login general hasta cerrar ese flujo.';
            return;
        }

        this.sifenPlatformService.getCurrentUser().subscribe({
            next: (user) => {
                this.loading = false;
                const tenantId = (user as any)?.tenantId || user.companyId;
                if (tenantId) {
                    this.sifenPlatformService.setSelectedTenant(String(tenantId));
                }
                this.router.navigateByUrl(this.resolveTargetRoute(user.role));
            },
            error: (error) => {
                this.loading = false;
                this.authService.logout();
                this.errorMessage = this.extractErrorMessage(error);
            }
        });
    }

    private extractErrorMessage(error: any): string {
        const message = error?.error?.message || error?.error?.error?.message || error?.error?.error || error?.message || 'No se pudo iniciar sesion.';
        if (typeof message === 'string' && message.includes('Invalid credentials')) {
            return 'Usuario o contrasena incorrectos.';
        }

        return typeof message === 'string' ? message : 'No se pudo iniciar sesion.';
    }
    private resolveTargetRoute(role?: string | null): string {
        if (this.returnUrl && this.returnUrl !== '/sifen') {
            return this.returnUrl;
        }

        return this.sifenPlatformService.isSuperAdminRole(role)
            ? '/sifen/admin/companies'
            : '/sifen/dashboard';
    }
}
