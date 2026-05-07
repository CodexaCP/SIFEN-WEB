import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SifenCompanyUsersResult, SifenPlatformService, SifenTenantUserSummary } from '../services/sifen-platform.service';

type TenantUserRole = 'TenantAdmin' | 'Operator' | 'Viewer';

@Component({
    selector: 'app-sifen-company-users',
    templateUrl: './sifen-company-users.component.html',
    styleUrls: ['./sifen-company-users.component.scss']
})
export class SifenCompanyUsersComponent implements OnInit {
    tenantId = '';
    usersResult?: SifenCompanyUsersResult;
    loading = false;
    saving = false;
    errorMessage = '';
    feedbackMessage = '';
    editingUserId: string | null = null;

    readonly roleOptions: TenantUserRole[] = ['TenantAdmin', 'Operator', 'Viewer'];

    formModel = this.createEmptyForm();

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    ngOnInit(): void {
        this.tenantId = this.route.snapshot.paramMap.get('tenantId') || this.sifenPlatformService.getActiveTenantId() || '';
        if (!this.tenantId) {
            this.router.navigate(['/sifen/dashboard']);
            return;
        }

        if (!this.sifenPlatformService.canManageTenantUsers(this.sifenPlatformService.getSessionUser())) {
            this.router.navigate(['/sifen/dashboard']);
            return;
        }

        this.sifenPlatformService.setSelectedTenant(this.tenantId);
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading = true;
        this.errorMessage = '';
        this.sifenPlatformService.getCompanyUsers(this.tenantId).subscribe({
            next: (result) => {
                this.usersResult = result;
                this.loading = false;
            },
            error: (error) => {
                this.usersResult = undefined;
                this.loading = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo cargar la gestion de usuarios del tenant.');
            }
        });
    }

    startCreate(): void {
        this.editingUserId = null;
        this.feedbackMessage = '';
        this.errorMessage = '';
        this.formModel = this.createEmptyForm();
    }

    editUser(user: SifenTenantUserSummary): void {
        this.editingUserId = user.userId;
        this.feedbackMessage = '';
        this.errorMessage = '';
        this.formModel = {
            fullName: user.fullName,
            email: user.email,
            password: '',
            role: this.normalizeRole(user.role),
            isActive: user.isActive
        };
    }

    saveUser(): void {
        if (this.saving) {
            return;
        }

        if (!this.formModel.fullName.trim() || !this.formModel.email.trim()) {
            this.errorMessage = 'Completa nombre y email del usuario.';
            return;
        }

        if (!this.editingUserId && !this.formModel.password.trim()) {
            this.errorMessage = 'La password inicial es obligatoria.';
            return;
        }

        this.saving = true;
        this.errorMessage = '';
        this.feedbackMessage = '';

        const request = this.editingUserId
            ? this.sifenPlatformService.updateCompanyUser(this.tenantId, this.editingUserId, {
                fullName: this.formModel.fullName.trim(),
                email: this.formModel.email.trim(),
                role: this.formModel.role,
                isActive: this.formModel.isActive
            })
            : this.sifenPlatformService.createCompanyUser(this.tenantId, {
                fullName: this.formModel.fullName.trim(),
                email: this.formModel.email.trim(),
                password: this.formModel.password.trim(),
                role: this.formModel.role,
                isActive: this.formModel.isActive
            });

        request.subscribe({
            next: () => {
                const wasEditing = !!this.editingUserId;
                this.saving = false;
                this.editingUserId = null;
                this.formModel = this.createEmptyForm();
                this.feedbackMessage = wasEditing
                    ? 'Usuario actualizado correctamente.'
                    : 'Usuario creado correctamente.';
                this.loadUsers();
            },
            error: (error) => {
                this.saving = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo guardar el usuario.');
            }
        });
    }

    toggleActive(user: SifenTenantUserSummary): void {
        this.editingUserId = user.userId;
        this.saving = true;
        this.errorMessage = '';
        this.feedbackMessage = '';

        this.sifenPlatformService.updateCompanyUser(this.tenantId, user.userId, {
            fullName: user.fullName,
            email: user.email,
            role: this.normalizeRole(user.role),
            isActive: !user.isActive
        }).subscribe({
            next: () => {
                this.saving = false;
                this.feedbackMessage = !user.isActive
                    ? 'Usuario activado correctamente.'
                    : 'Usuario inactivado correctamente.';
                this.editingUserId = null;
                this.loadUsers();
            },
            error: (error) => {
                this.saving = false;
                this.editingUserId = null;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo actualizar el estado del usuario.');
            }
        });
    }

    get companyName(): string {
        return this.usersResult?.companyName || this.tenantId;
    }

    get usersUsageLabel(): string {
        if (!this.usersResult) {
            return '--';
        }

        return this.usersResult.maxUsers
            ? `${this.usersResult.activeUsers} / ${this.usersResult.maxUsers}`
            : `${this.usersResult.activeUsers} / sin limite`;
    }

    get limitReached(): boolean {
        return !!this.usersResult?.maxUsers && this.usersResult.activeUsers >= this.usersResult.maxUsers;
    }

    get limitMessage(): string {
        if (!this.usersResult?.maxUsers) {
            return '';
        }

        return `Tu plan permite un máximo de ${this.usersResult.maxUsers} usuarios activos. Inactiva un usuario o actualiza tu plan.`;
    }

    private normalizeRole(role?: string | null): TenantUserRole {
        const normalized = String(role || '').trim();
        if (normalized === 'TenantAdmin' || normalized === 'Operator' || normalized === 'Viewer') {
            return normalized;
        }

        return 'Operator';
    }

    private createEmptyForm() {
        return {
            fullName: '',
            email: '',
            password: '',
            role: 'Operator' as TenantUserRole,
            isActive: true
        };
    }
}
