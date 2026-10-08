import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SifenConfigModel, SifenPlatformService } from '../services/sifen-platform.service';

@Component({
    selector: 'app-sifen-config',
    templateUrl: './sifen-config.component.html',
    styleUrls: ['./sifen-config.component.scss']
})
export class SifenConfigComponent implements OnInit {
    tenantId = '';
    model: SifenConfigModel = {
        tenantId: '',
        ruc: '',
        rucCheckDigit: '',
        legalName: '',
        environment: 'Test',
        cscIdentifier: '',
        cscSecretReference: '',
        certificateSecretReference: '',
        certificatePasswordSecretReference: '',
        certificateAlias: '',
        establishment: '001',
        expeditionPoint: '001',
        currentNumber: '0000001',
        stampingNumber: '',
        xmlSchemaRootPath: '',
        endpointUrl: '',
        transportMode: 'Diagnostic',
        readySummary: null
    };
    loading = false;
    saving = false;
    errorMessage = '';
    successMessage = '';

    get tenantName(): string {
        return this.sifenPlatformService.getActiveTenantName() || 'la empresa seleccionada';
    }

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
        this.model.tenantId = this.tenantId;
        this.loadConfig();
    }

    loadConfig(): void {
        this.loading = true;
        this.errorMessage = '';
        this.sifenPlatformService.getSifenConfig(this.tenantId).subscribe({
            next: (config) => {
                this.model = config;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo cargar la configuracion SIFEN del tenant.');
            }
        });
    }

    save(): void {
        if (this.saving) {
            return;
        }

        this.saving = true;
        this.successMessage = '';
        this.errorMessage = '';
        this.sifenPlatformService.updateSifenConfig(this.tenantId, this.model).subscribe({
            next: (config) => {
                this.model = config;
                this.saving = false;
                this.successMessage = 'Configuracion SIFEN guardada correctamente.';
            },
            error: (error) => {
                this.saving = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo guardar la configuracion SIFEN.');
            }
        });
    }
}
