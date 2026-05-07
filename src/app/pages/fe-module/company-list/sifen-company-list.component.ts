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
        this.router.navigate(['/sifen/admin/companies', company.tenantId]);
    }

    statusSeverity(status: string) {
        return this.sifenPlatformService.getStatusSeverity(status);
    }
}
