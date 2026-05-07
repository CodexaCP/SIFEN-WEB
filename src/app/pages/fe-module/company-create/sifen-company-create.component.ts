import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SifenPlatformService } from '../services/sifen-platform.service';

@Component({
    selector: 'app-sifen-company-create',
    templateUrl: './sifen-company-create.component.html',
    styleUrls: ['./sifen-company-create.component.scss']
})
export class SifenCompanyCreateComponent {
    model = {
        slug: '',
        businessName: '',
        planName: 'Plan base',
        invoiceLimitPerMonth: 150,
        userLimit: 5,
        adminFullName: '',
        adminEmail: '',
        adminPassword: ''
    };

    loading = false;
    errorMessage = '';

    constructor(
        private readonly router: Router,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    save(): void {
        if (this.loading) {
            return;
        }

        if (!this.model.slug.trim() || !this.model.businessName.trim()) {
            this.errorMessage = 'Completa slug y nombre comercial.';
            return;
        }

        if (!this.model.planName.trim() || !this.model.adminFullName.trim() || !this.model.adminEmail.trim() || !this.model.adminPassword.trim()) {
            this.errorMessage = 'Completa plan y datos del admin principal.';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.sifenPlatformService.createCompany(this.model).subscribe({
            next: (company) => {
                this.loading = false;
                this.router.navigate(['/sifen/admin/companies', company.tenantId]);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo crear la compania.');
            }
        });
    }
}
