import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import {
    SifenCertificateMetadataPayload,
    SifenFiscalProfilePayload,
    SifenFiscalStampPayload,
    SifenNumberingSequencePayload,
    SifenPlatformService
} from '../services/sifen-platform.service';

type FiscalSection = 'profile' | 'stamp' | 'numbering' | 'certificate';

interface SectionFeedback {
    saving: boolean;
    success: string;
    error: string;
}

@Component({
    selector: 'app-sifen-fiscal-onboarding',
    templateUrl: './sifen-fiscal-onboarding.component.html',
    styleUrls: ['../sifen-config/sifen-config.component.scss', './sifen-fiscal-onboarding.component.scss']
})
export class SifenFiscalOnboardingComponent implements OnInit {
    tenantId = '';
    errorMessage = '';

    profile: SifenFiscalProfilePayload = {
        taxpayerType: 2,
        address: '',
        houseNumber: '',
        departmentCode: '',
        departmentDescription: '',
        districtCode: '',
        districtDescription: '',
        cityCode: '',
        cityDescription: '',
        phone: '',
        email: '',
        economicActivities: [{ code: '', description: '' }]
    };

    stamp: SifenFiscalStampPayload = {
        environment: 'Test',
        stampingNumber: '',
        validFrom: '',
        validTo: ''
    };

    numbering: SifenNumberingSequencePayload = {
        environment: 'Test',
        stampingNumber: '',
        documentTypeCode: '01',
        establishmentCode: '001',
        expeditionPointCode: '001',
        series: '',
        firstNumber: 1
    };

    certificate: SifenCertificateMetadataPayload = {
        environment: 'Test',
        purpose: 'XmlSignature',
        alias: '',
        subject: '',
        fingerprintSha256: '',
        serialNumber: '',
        certificateSecretReference: '',
        certificatePasswordSecretReference: '',
        validFrom: '',
        validTo: ''
    };

    feedback: Record<FiscalSection, SectionFeedback> = {
        profile: { saving: false, success: '', error: '' },
        stamp: { saving: false, success: '', error: '' },
        numbering: { saving: false, success: '', error: '' },
        certificate: { saving: false, success: '', error: '' }
    };

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
    }

    addActivity(): void {
        this.profile.economicActivities.push({ code: '', description: '' });
    }

    removeActivity(index: number): void {
        this.profile.economicActivities.splice(index, 1);
    }

    onStampNumberChange(value: string): void {
        if (!this.numbering.stampingNumber) {
            this.numbering.stampingNumber = value;
        }
    }

    saveProfile(): void {
        this.save('profile', this.sifenPlatformService.registerFiscalProfile(this.tenantId, this.profile), 'Datos fiscales guardados.');
    }

    saveStamp(): void {
        this.save('stamp', this.sifenPlatformService.registerFiscalStamp(this.tenantId, this.stamp), 'Timbrado registrado.');
    }

    saveNumbering(): void {
        this.save('numbering', this.sifenPlatformService.registerNumberingSequence(this.tenantId, this.numbering), 'Numeracion registrada.');
    }

    saveCertificate(): void {
        this.save('certificate', this.sifenPlatformService.registerCertificateMetadata(this.tenantId, this.certificate), 'Certificado registrado.');
    }

    private save(section: FiscalSection, request: Observable<void>, successMessage: string): void {
        const state = this.feedback[section];
        if (state.saving || !this.tenantId) {
            return;
        }

        state.saving = true;
        state.success = '';
        state.error = '';
        request.pipe(finalize(() => (state.saving = false))).subscribe({
            next: () => {
                state.success = successMessage;
            },
            error: (error) => {
                state.error = this.sifenPlatformService.getErrorMessage(error, 'No se pudo guardar este bloque.');
            }
        });
    }
}
