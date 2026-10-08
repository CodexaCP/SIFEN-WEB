import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { SifenCompanyDetail, SifenPlatformService } from '../services/sifen-platform.service';

@Component({
    selector: 'app-sifen-company-detail',
    templateUrl: './sifen-company-detail.component.html',
    styleUrls: ['./sifen-company-detail.component.scss']
})
export class SifenCompanyDetailComponent implements OnInit {
    tenantId = '';
    company?: SifenCompanyDetail;
    loading = false;
    feedbackMessage = '';
    errorMessage = '';

    planModel = {
        planName: '',
        invoiceLimitPerMonth: 150,
        userLimit: 5
    };

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    ngOnInit(): void {
        this.tenantId = this.route.snapshot.paramMap.get('tenantId') || '';
        this.sifenPlatformService.setSelectedTenant(this.tenantId);
        this.loadCompany();
    }

    loadCompany(): void {
        this.loading = true;
        this.errorMessage = '';
        this.sifenPlatformService.getCompany(this.tenantId).subscribe({
            next: (company) => {
                this.company = company;
                this.sifenPlatformService.setSelectedTenant(this.tenantId, company.businessName);
                this.planModel = {
                    planName: company.planName || 'Plan base',
                    invoiceLimitPerMonth: company.invoiceLimitPerMonth || 150,
                    userLimit: company.userLimit || 5
                };
                this.loading = false;
            },
            error: (error) => {
                this.company = undefined;
                this.loading = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo cargar el detalle de la compania.');
            }
        });
    }

    savePlan(): void {
        this.feedbackMessage = '';
        this.errorMessage = '';
        this.sifenPlatformService.updatePlan(this.tenantId, this.planModel).subscribe({
            next: () => {
                this.feedbackMessage = 'Plan actualizado correctamente.';
                this.loadCompany();
            },
            error: (error) => {
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo actualizar el plan.');
            }
        });
    }

    openOperations(): void {
        this.sifenPlatformService.setSelectedTenant(this.tenantId);
        this.router.navigate(['/sifen/invoices']);
    }

    openIntegration(): void {
        this.sifenPlatformService.setSelectedTenant(this.tenantId);
        this.router.navigate(['/sifen/integration']);
    }

    openUsers(): void {
        this.sifenPlatformService.setSelectedTenant(this.tenantId);
        this.router.navigate(['/sifen/admin/companies', this.tenantId, 'users']);
    }

    statusSeverity(status?: string | null) {
        return this.sifenPlatformService.getStatusSeverity(status);
    }
}
