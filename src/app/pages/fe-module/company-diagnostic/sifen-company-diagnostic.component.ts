import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SifenDiagnosticResult, SifenPlatformService } from '../services/sifen-platform.service';

@Component({
    selector: 'app-sifen-company-diagnostic',
    templateUrl: './sifen-company-diagnostic.component.html',
    styleUrls: ['./sifen-company-diagnostic.component.scss']
})
export class SifenCompanyDiagnosticComponent implements OnInit {
    tenantId = '';
    diagnostic?: SifenDiagnosticResult;
    loading = false;
    errorMessage = '';

    constructor(
        private readonly route: ActivatedRoute,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    ngOnInit(): void {
        this.tenantId = this.route.snapshot.paramMap.get('tenantId') || this.sifenPlatformService.getActiveTenantId() || '';
        if (!this.tenantId) {
            this.errorMessage = 'No se pudo resolver el tenant activo.';
            return;
        }
        this.sifenPlatformService.setSelectedTenant(this.tenantId);
        this.loadDiagnostic();
    }

    loadDiagnostic(): void {
        this.loading = true;
        this.errorMessage = '';
        this.sifenPlatformService.getDiagnostic(this.tenantId).subscribe({
            next: (diagnostic) => {
                this.diagnostic = diagnostic;
                this.loading = false;
            },
            error: (error) => {
                this.diagnostic = undefined;
                this.loading = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo cargar el diagnostico del tenant.');
            }
        });
    }

    get overallSeverity(): 'success' | 'warning' | 'danger' {
        return this.diagnostic?.globalStatus === 'READY_TEST'
            ? 'success'
            : this.diagnostic?.globalStatus === 'PARTIAL'
                ? 'warning'
                : 'danger';
    }

    get overallLabel(): string {
        return this.diagnostic?.globalStatus === 'READY_TEST'
            ? 'READY_TEST'
            : this.diagnostic?.globalStatus === 'PARTIAL'
                ? 'PARTIAL'
                : 'BLOCKED';
    }

    get guidedSummary(): string {
        if (!this.diagnostic) {
            return 'Estamos revisando la configuracion de esta compania.';
        }

        if (this.diagnostic.globalStatus === 'READY_TEST') {
            return 'La base TEST del tenant esta lista para operar internamente.';
        }

        if (this.diagnostic.globalStatus === 'PARTIAL') {
            return 'La base TEST funciona, pero quedan datos pendientes antes de cerrar readiness completa.';
        }

        return 'Todavia faltan datos criticos antes de preparar facturas en modo TEST.';
    }

    get nextAction(): string {
        const firstMissing = this.diagnostic?.missingItems?.[0];
        return firstMissing ? `Siguiente paso: ${firstMissing}` : 'No hay acciones pendientes por ahora.';
    }

    getCheckSeverity(status: string): 'success' | 'warning' | 'danger' {
        const normalized = status.toUpperCase();
        return normalized === 'OK'
            ? 'success'
            : normalized === 'WARNING'
                ? 'warning'
                : 'danger';
    }
}
