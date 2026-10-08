import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize, forkJoin } from 'rxjs';
import {
    SifenCertificateMetadataPayload,
    SifenEnvironmentName,
    SifenFiscalSetup,
    SifenFiscalProfilePayload,
    SifenFiscalStampPayload,
    SifenNumberingSequencePayload,
    SifenPlatformService,
    SifenReadinessReport
} from '../services/sifen-platform.service';

type FiscalSection = 'profile' | 'stamp' | 'numbering' | 'certificate';

const READINESS_LABELS: Record<string, string> = {
    'tenant.exists': 'Empresa creada',
    'tenant.active': 'Empresa activa',
    'taxpayer_profile.active': 'RUC y razon social',
    'sifen_settings.active': 'Config SIFEN del ambiente',
    'csc.secret': 'CSC disponible',
    'certificate.xml_signature': 'Certificado de firma XML',
    'certificate.mutual_tls': 'Certificado TLS mutuo'
};

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
    viewEnvironment: SifenEnvironmentName = 'Test';
    loading = false;
    setup: SifenFiscalSetup | null = null;
    readiness: SifenReadinessReport | null = null;

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
        this.load();
    }

    load(): void {
        if (!this.tenantId) {
            return;
        }

        this.loading = true;
        forkJoin({
            setup: this.sifenPlatformService.getFiscalSetup(this.tenantId, this.viewEnvironment),
            readiness: this.sifenPlatformService.getReadiness(this.tenantId, this.viewEnvironment)
        })
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: ({ setup, readiness }) => {
                    this.setup = setup;
                    this.readiness = readiness;
                    this.applyProfile(setup);
                },
                error: (error) => {
                    this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo leer el alta fiscal.');
                }
            });
    }

    readinessLabel(name: string): string {
        return READINESS_LABELS[name] ?? name;
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

    private applyProfile(setup: SifenFiscalSetup): void {
        const profile = setup.profile;
        if (!profile) {
            return;
        }

        this.profile = {
            taxpayerType: profile.taxpayerType ?? this.profile.taxpayerType,
            address: profile.address ?? '',
            houseNumber: profile.houseNumber ?? '',
            departmentCode: profile.departmentCode ?? '',
            departmentDescription: profile.departmentDescription ?? '',
            districtCode: profile.districtCode ?? '',
            districtDescription: profile.districtDescription ?? '',
            cityCode: profile.cityCode ?? '',
            cityDescription: profile.cityDescription ?? '',
            phone: profile.phone ?? '',
            email: profile.email ?? '',
            economicActivities: profile.economicActivities?.length
                ? profile.economicActivities.map((activity) => ({ ...activity }))
                : [{ code: '', description: '' }]
        };
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
                this.load();
            },
            error: (error) => {
                state.error = this.sifenPlatformService.getErrorMessage(error, 'No se pudo guardar este bloque.');
            }
        });
    }
}
