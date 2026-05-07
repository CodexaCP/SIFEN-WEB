import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SifenKudeTemplateSettings, SifenPlatformService } from '../services/sifen-platform.service';

@Component({
    selector: 'app-sifen-kude-config',
    templateUrl: './sifen-kude-config.component.html',
    styleUrls: ['./sifen-kude-config.component.scss']
})
export class SifenKudeConfigComponent implements OnInit {
    tenantId = '';
    loading = false;
    saving = false;
    previewLoading = false;
    feedbackMessage = '';
    errorMessage = '';
    previewHtml = '';

    model: SifenKudeTemplateSettings = {
        tenantId: '',
        templateCode: 'codexa-standard',
        logoUrl: '',
        primaryColor: '#2D9CDB',
        secondaryColor: '#EAF6FD',
        footerText: 'Consulte este comprobante en la SET',
        showPhone: true,
        showEmail: true
    };

    constructor(
        private readonly router: Router,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    ngOnInit(): void {
        this.tenantId = this.sifenPlatformService.getActiveTenantId() || '';
        if (!this.tenantId || !this.sifenPlatformService.canConfigureTenant(this.sifenPlatformService.getSessionUser())) {
            this.router.navigate(['/sifen/dashboard']);
            return;
        }

        this.model.tenantId = this.tenantId;
        this.loadSettings();
    }

    loadSettings(): void {
        this.loading = true;
        this.errorMessage = '';
        this.sifenPlatformService.getKudeTemplate(this.tenantId).subscribe({
            next: (settings) => {
                this.model = settings;
                this.loading = false;
                this.loadPreview();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo cargar la configuracion KuDE.');
            }
        });
    }

    loadPreview(): void {
        this.previewLoading = true;
        this.sifenPlatformService.getKudePreviewHtml(this.model).subscribe({
            next: (html) => {
                this.previewHtml = html;
                this.previewLoading = false;
            },
            error: (error) => {
                this.previewLoading = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo generar la vista previa KuDE.');
            }
        });
    }

    save(): void {
        this.saving = true;
        this.feedbackMessage = '';
        this.errorMessage = '';
        this.sifenPlatformService.updateKudeTemplate(this.tenantId, this.model).subscribe({
            next: (settings) => {
                this.model = settings;
                this.saving = false;
                this.feedbackMessage = 'Plantilla KuDE actualizada correctamente.';
                this.loadPreview();
            },
            error: (error) => {
                this.saving = false;
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo guardar la plantilla KuDE.');
            }
        });
    }

    downloadDemoPdf(): void {
        this.feedbackMessage = '';
        this.errorMessage = '';
        this.sifenPlatformService.downloadKudePreviewPdf(this.model).subscribe({
            next: (file) => {
                const url = window.URL.createObjectURL(file.content);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = file.fileName;
                anchor.click();
                window.URL.revokeObjectURL(url);
                this.feedbackMessage = 'PDF demo descargado correctamente.';
            },
            error: (error) => {
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo descargar el PDF demo.');
            }
        });
    }
}
