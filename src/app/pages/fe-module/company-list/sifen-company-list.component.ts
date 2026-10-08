import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SifenCompanySummary, SifenPlatformService } from '../services/sifen-platform.service';

@Component({
    selector: 'app-sifen-company-list',
    templateUrl: './sifen-company-list.component.html',
    styleUrls: ['./sifen-company-list.component.scss']
})
export class SifenCompanyListComponent implements OnInit {
    companies: SifenCompanySummary[] = [];
    loading = false;
    errorMessage = '';
    deleteVisible = false;
    deleteTarget: SifenCompanySummary | null = null;
    deleteConfirmation = '';
    deleteError = '';
    deleting = false;

    constructor(
        private readonly router: Router,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    ngOnInit(): void {
        this.loadCompanies();
    }

    loadCompanies(): void {
        this.loading = true;
        this.errorMessage = '';
        this.sifenPlatformService.getCompanies().subscribe({
            next: (companies) => {
                this.companies = companies;
                this.loading = false;
            },
            error: (error) => {
                this.companies = [];
                this.loading = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo cargar el listado de companias.');
            }
        });
    }

    openCreate(): void {
        this.router.navigate(['/sifen/admin/companies/new']);
    }

    openDetail(company: SifenCompanySummary): void {
        this.sifenPlatformService.setSelectedTenant(company.tenantId, company.businessName);
        this.router.navigate(['/sifen/admin/companies', company.tenantId]);
    }

    open(company: SifenCompanySummary, section: 'users' | 'fiscal' | 'diagnostic'): void {
        this.sifenPlatformService.setSelectedTenant(company.tenantId, company.businessName);
        this.router.navigate(['/sifen/admin/companies', company.tenantId, section]);
    }

    askDelete(company: SifenCompanySummary): void {
        this.deleteTarget = company;
        this.deleteConfirmation = '';
        this.deleteError = '';
        this.deleteVisible = true;
    }

    closeDelete(): void {
        if (this.deleting) {
            return;
        }

        this.deleteVisible = false;
        this.deleteTarget = null;
    }

    get canConfirmDelete(): boolean {
        return !!this.deleteTarget && this.deleteConfirmation.trim().toLowerCase() === this.deleteTarget.slug.toLowerCase();
    }

    confirmDelete(): void {
        const target = this.deleteTarget;
        if (!target || !this.canConfirmDelete || this.deleting) {
            return;
        }

        this.deleting = true;
        this.deleteError = '';
        this.sifenPlatformService.deleteCompany(target.tenantId, this.deleteConfirmation.trim()).subscribe({
            next: () => {
                this.deleting = false;
                if (this.sifenPlatformService.getActiveTenantId() === target.tenantId) {
                    this.sifenPlatformService.clearSelectedTenant();
                }
                this.closeDelete();
                this.loadCompanies();
            },
            error: (error) => {
                this.deleting = false;
                this.deleteError = this.sifenPlatformService.getErrorMessage(error, 'No se pudo eliminar la compania.');
            }
        });
    }

    statusSeverity(status: string) {
        return this.sifenPlatformService.getStatusSeverity(status);
    }
}
