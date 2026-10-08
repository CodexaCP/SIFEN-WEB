import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { AuthService, SessionUser } from '@core/service/auth.service';
import { environment } from 'src/environments/environment';
import { extractApiErrorMessage } from '@core/utils/api-error';

export interface SifenCompanySummary {
    tenantId: string;
    slug: string;
    businessName: string;
    status: string;
    planName?: string | null;
    invoiceLimitPerMonth?: number | null;
    userLimit?: number | null;
}

export interface SifenCompanyDetail extends SifenCompanySummary {
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface SifenCompanyCreatePayload {
    slug: string;
    businessName: string;
    planName: string;
    invoiceLimitPerMonth: number;
    userLimit: number;
    adminFullName: string;
    adminEmail: string;
    adminPassword: string;
}

export interface SifenPlanUpdatePayload {
    invoiceLimitPerMonth: number;
    userLimit: number;
    planName?: string | null;
}

export interface SifenAdminCreatePayload {
    fullName: string;
    email: string;
    password: string;
}

export interface SifenTenantUserSummary {
    userId: string;
    tenantId: string;
    fullName: string;
    email: string;
    role: string;
    isActive: boolean;
}

export interface SifenCompanyUsersResult {
    tenantId: string;
    companyName: string;
    planName: string;
    activeUsers: number;
    maxUsers: number | null;
    users: SifenTenantUserSummary[];
}

export interface SifenTenantUserCreatePayload {
    fullName: string;
    email: string;
    password: string;
    role: 'TenantAdmin' | 'Operator' | 'Viewer';
    isActive: boolean;
}

export interface SifenTenantUserUpdatePayload {
    fullName: string;
    email: string;
    role: 'TenantAdmin' | 'Operator' | 'Viewer';
    isActive: boolean;
}

export interface SifenKudeTemplateSettings {
    tenantId: string;
    templateCode: string;
    logoUrl?: string | null;
    primaryColor: string;
    secondaryColor: string;
    footerText: string;
    showPhone: boolean;
    showEmail: boolean;
}

export interface SifenDiagnosticResult {
    tenantId?: string;
    globalStatus: 'READY_TEST' | 'PARTIAL' | 'BLOCKED';
    mode: string;
    transportMode?: string;
    ready: boolean;
    readyForInternalValidation: boolean;
    readyForSifenTestAttempt: boolean;
    missingItems: string[];
    warnings: string[];
    checks: Array<{
        key: string;
        label: string;
        status: string;
        message: string;
    }>;
    lastError?: {
        cdc?: string | null;
        status?: string | null;
        statusCode?: string | null;
        statusMessage?: string | null;
        occurredAt?: string | null;
    } | null;
    lastSubmission?: {
        cdc?: string | null;
        status?: string | null;
        submittedAt?: string | null;
        endpoint?: string | null;
    } | null;
    readySummary?: string | null;
}

export interface SifenConfigModel {
    tenantId: string;
    ruc: string;
    rucCheckDigit: string;
    legalName: string;
    environment: 'Test' | 'Production';
    cscIdentifier: string;
    cscSecretReference: string;
    certificateSecretReference: string;
    certificatePasswordSecretReference: string;
    certificateAlias: string;
    establishment: string;
    expeditionPoint: string;
    currentNumber: string;
    stampingNumber: string;
    xmlSchemaRootPath: string;
    endpointUrl: string;
    transportMode: 'Diagnostic' | 'Live';
    readySummary?: string | null;
}

export type SifenEnvironmentName = 'Test' | 'Production';

export interface SifenEconomicActivity {
    code: string;
    description: string;
}

export interface SifenFiscalProfilePayload {
    taxpayerType: 1 | 2;
    address: string;
    houseNumber: string;
    departmentCode: string;
    departmentDescription: string;
    districtCode: string;
    districtDescription: string;
    cityCode: string;
    cityDescription: string;
    phone: string;
    email: string;
    economicActivities: SifenEconomicActivity[];
}

export interface SifenFiscalStampPayload {
    environment: SifenEnvironmentName;
    stampingNumber: string;
    validFrom: string;
    validTo: string;
}

export interface SifenNumberingSequencePayload {
    environment: SifenEnvironmentName;
    stampingNumber: string;
    documentTypeCode: string;
    establishmentCode: string;
    expeditionPointCode: string;
    series: string;
    firstNumber: number | null;
}

export interface SifenCertificateMetadataPayload {
    environment: SifenEnvironmentName;
    purpose: 'XmlSignature' | 'MutualTls';
    alias: string;
    subject: string;
    fingerprintSha256: string;
    serialNumber: string;
    certificateSecretReference: string;
    certificatePasswordSecretReference: string;
    validFrom: string;
    validTo: string;
}

export interface SifenFiscalSetup {
    tenantId: string;
    environment: SifenEnvironmentName;
    profile: {
        rucNumber: string;
        rucCheckDigit: string;
        legalName: string;
        tradeName: string | null;
        taxpayerType: 1 | 2 | null;
        address: string | null;
        houseNumber: string | null;
        departmentCode: string | null;
        departmentDescription: string | null;
        districtCode: string | null;
        districtDescription: string | null;
        cityCode: string | null;
        cityDescription: string | null;
        phone: string | null;
        email: string | null;
        economicActivities: SifenEconomicActivity[];
    } | null;
    stamps: { id: string; stampingNumber: string; validFrom: string; validTo: string | null; isActive: boolean }[];
    numberingSequences: {
        id: string;
        stampingNumber: string;
        documentTypeCode: string;
        establishmentCode: string;
        expeditionPointCode: string;
        series: string;
        nextNumber: number;
        isActive: boolean;
    }[];
    certificates: {
        id: string;
        purpose: 'XmlSignature' | 'MutualTls';
        alias: string;
        subject: string;
        fingerprintSha256: string;
        serialNumber: string;
        certificateSecretReference: string;
        certificatePasswordSecretReference: string;
        validFrom: string;
        validTo: string;
        isActive: boolean;
    }[];
}

export interface SifenTenantLogItem {
    id: string;
    invoiceId: string | null;
    correlationId: string | null;
    level: string;
    source: string;
    message: string;
    technicalDetail: string | null;
    createdAt: string;
}

export interface SifenReadinessReport {
    tenantId: string;
    environment: SifenEnvironmentName;
    isReadyForSifenTest: boolean;
    checks: { name: string; isReady: boolean; summary: string }[];
}

@Injectable({ providedIn: 'root' })
export class SifenPlatformService {
    private readonly apiUrl = environment.apiUrl;
    private readonly onboardingUrl = `${environment.apiUrl.replace(/\/api\/?$/, '')}/internal/onboarding`;
    private readonly selectedTenantKey = 'sifen_selected_tenant';

    constructor(
        private readonly http: HttpClient,
        private readonly authService: AuthService
    ) {}

    getCurrentUser(): Observable<SessionUser> {
        return this.authService.me().pipe(
            map((user) => ({
                ...user,
                role: this.normalizeRole(user.role),
                displayName: user.displayName || user.email || this.authService.getDisplayName()
            })),
            tap((user) => this.authService.saveSessionUser(user))
        );
    }

    getCompanies(): Observable<SifenCompanySummary[]> {
        return this.http.get<any[]>(`${this.apiUrl}/platform/companies`).pipe(
            map((companies) => (companies || []).map((company) => this.mapCompany(company)))
        );
    }

    createCompany(payload: SifenCompanyCreatePayload): Observable<SifenCompanyDetail> {
        return this.http.post<any>(`${this.apiUrl}/platform/companies`, {
            slug: payload.slug,
            displayName: payload.businessName,
            planName: payload.planName,
            maxInvoicesPerMonth: payload.invoiceLimitPerMonth,
            maxUsers: payload.userLimit,
            adminFullName: payload.adminFullName,
            adminEmail: payload.adminEmail,
            adminPassword: payload.adminPassword
        }).pipe(
            map((company) => this.mapCompany(company))
        );
    }

    getCompany(tenantId: string): Observable<SifenCompanyDetail> {
        return this.http.get<any>(`${this.apiUrl}/platform/companies/${tenantId}`).pipe(
            map((company) => this.mapCompany(company))
        );
    }

    updatePlan(tenantId: string, payload: SifenPlanUpdatePayload): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/platform/companies/${tenantId}/plan`, payload);
    }

    createAdmin(tenantId: string, payload: SifenAdminCreatePayload): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/platform/companies/${tenantId}/admins`, {
            fullName: payload.fullName,
            email: payload.email,
            password: payload.password
        });
    }

    getCompanyUsers(tenantId: string): Observable<SifenCompanyUsersResult> {
        return this.http.get<any>(`${this.apiUrl}/platform/companies/${tenantId}/users`).pipe(
            map((result) => this.mapCompanyUsers(result))
        );
    }

    createCompanyUser(tenantId: string, payload: SifenTenantUserCreatePayload): Observable<SifenTenantUserSummary> {
        return this.http.post<any>(`${this.apiUrl}/platform/companies/${tenantId}/users`, payload).pipe(
            map((user) => this.mapTenantUser(user))
        );
    }

    updateCompanyUser(tenantId: string, userId: string, payload: SifenTenantUserUpdatePayload): Observable<SifenTenantUserSummary> {
        return this.http.put<any>(`${this.apiUrl}/platform/companies/${tenantId}/users/${userId}`, payload).pipe(
            map((user) => this.mapTenantUser(user))
        );
    }

    getKudeTemplate(tenantId: string): Observable<SifenKudeTemplateSettings> {
        return this.http.get<any>(`${this.apiUrl}/platform/companies/${tenantId}/kude-template`).pipe(
            map((settings) => this.mapKudeTemplate(settings, tenantId))
        );
    }

    updateKudeTemplate(tenantId: string, payload: SifenKudeTemplateSettings): Observable<SifenKudeTemplateSettings> {
        return this.http.put<any>(`${this.apiUrl}/platform/companies/${tenantId}/kude-template`, {
            templateCode: payload.templateCode,
            logoUrl: payload.logoUrl || null,
            primaryColor: payload.primaryColor,
            secondaryColor: payload.secondaryColor,
            footerText: payload.footerText,
            showPhone: payload.showPhone,
            showEmail: payload.showEmail
        }).pipe(
            map((settings) => this.mapKudeTemplate(settings, tenantId))
        );
    }

    getKudePreviewHtml(payload: Partial<SifenKudeTemplateSettings>): Observable<string> {
        return this.http.post(`${this.apiUrl}/fe/invoices/kude/preview`, {
            templateCode: payload.templateCode,
            logoUrl: payload.logoUrl || null,
            primaryColor: payload.primaryColor,
            secondaryColor: payload.secondaryColor,
            footerText: payload.footerText,
            showPhone: payload.showPhone,
            showEmail: payload.showEmail
        }, {
            responseType: 'text' as const,
            headers: this.buildTenantHeaders()
        });
    }

    downloadKudePreviewPdf(payload: Partial<SifenKudeTemplateSettings>): Observable<{ fileName: string; content: Blob }> {
        return this.http.post(`${this.apiUrl}/fe/invoices/kude/preview/pdf`, {
            templateCode: payload.templateCode,
            logoUrl: payload.logoUrl || null,
            primaryColor: payload.primaryColor,
            secondaryColor: payload.secondaryColor,
            footerText: payload.footerText,
            showPhone: payload.showPhone,
            showEmail: payload.showEmail
        }, {
            observe: 'response',
            responseType: 'blob' as const,
            headers: this.buildTenantHeaders()
        }).pipe(
            map((response) => ({
                fileName: this.getFileName(response.headers) ?? 'kude-codexa-standard-demo.pdf',
                content: response.body ?? new Blob([], { type: 'application/pdf' })
            }))
        );
    }

    getDiagnostic(tenantId: string): Observable<SifenDiagnosticResult> {
        return this.http.get<any>(`${this.apiUrl}/fe/tenants/${tenantId}/diagnostic`, {
            headers: this.buildTenantHeadersFor(tenantId)
        }).pipe(
            map((diagnostic) => ({
                tenantId: diagnostic?.tenantId ? String(diagnostic.tenantId) : tenantId,
                globalStatus: diagnostic?.globalStatus ?? 'BLOCKED',
                mode: diagnostic?.mode ?? 'TEST_INTERNAL',
                transportMode: diagnostic?.transportMode ?? 'Diagnostic',
                ready: diagnostic?.globalStatus === 'READY_TEST',
                readyForInternalValidation: diagnostic?.globalStatus !== 'BLOCKED',
                readyForSifenTestAttempt: diagnostic?.globalStatus === 'READY_TEST',
                missingItems: Array.isArray(diagnostic?.checks) ? diagnostic.checks.filter((check: any) => String(check?.status ?? '').toUpperCase() === 'ERROR').map((check: any) => String(check?.message ?? '')) : [],
                warnings: Array.isArray(diagnostic?.checks) ? diagnostic.checks.filter((check: any) => String(check?.status ?? '').toUpperCase() === 'WARNING').map((check: any) => String(check?.message ?? '')) : [],
                checks: Array.isArray(diagnostic?.checks) ? diagnostic.checks.map((check: any) => ({
                    key: String(check?.key ?? check?.code ?? ''),
                    label: String(check?.label ?? check?.key ?? check?.code ?? ''),
                    status: String(check?.status ?? ''),
                    message: String(check?.message ?? '')
                })) : [],
                lastError: diagnostic?.lastError ?? null,
                lastSubmission: diagnostic?.lastSubmission ?? null,
                readySummary: diagnostic?.readySummary ?? diagnostic?.summary ?? null
            }))
        );
    }

    getFiscalSetup(tenantId: string, environment: SifenEnvironmentName = 'Test'): Observable<SifenFiscalSetup> {
        return this.http.get<SifenFiscalSetup>(`${this.onboardingUrl}/tenants/${tenantId}/fiscal-setup`, { params: { environment } });
    }

    getTenantLogs(tenantId: string, level?: string): Observable<SifenTenantLogItem[]> {
        const params: Record<string, string> = level ? { level } : {};
        return this.http.get<SifenTenantLogItem[]>(`${this.apiUrl}/fe/tenants/${tenantId}/logs`, { params });
    }

    getReadiness(tenantId: string, environment: SifenEnvironmentName = 'Test'): Observable<SifenReadinessReport> {
        return this.http.get<SifenReadinessReport>(`${this.onboardingUrl}/tenants/${tenantId}/readiness`, { params: { environment } });
    }

    registerFiscalProfile(tenantId: string, payload: SifenFiscalProfilePayload): Observable<void> {
        return this.http.post<void>(`${this.onboardingUrl}/tenants/${tenantId}/fiscal-profile`, {
            taxpayerType: payload.taxpayerType,
            address: payload.address,
            houseNumber: payload.houseNumber || null,
            departmentCode: payload.departmentCode || null,
            departmentDescription: payload.departmentDescription || null,
            districtCode: payload.districtCode || null,
            districtDescription: payload.districtDescription || null,
            cityCode: payload.cityCode || null,
            cityDescription: payload.cityDescription || null,
            phone: payload.phone || null,
            email: payload.email || null,
            economicActivities: payload.economicActivities.filter((activity) => activity.code.trim() || activity.description.trim())
        });
    }

    registerFiscalStamp(tenantId: string, payload: SifenFiscalStampPayload): Observable<void> {
        return this.http.post<void>(`${this.onboardingUrl}/tenants/${tenantId}/fiscal-stamps`, {
            environment: payload.environment,
            stampingNumber: payload.stampingNumber,
            validFrom: payload.validFrom,
            validTo: payload.validTo || null
        });
    }

    registerNumberingSequence(tenantId: string, payload: SifenNumberingSequencePayload): Observable<void> {
        return this.http.post<void>(`${this.onboardingUrl}/tenants/${tenantId}/numbering-sequences`, {
            environment: payload.environment,
            stampingNumber: payload.stampingNumber,
            documentTypeCode: payload.documentTypeCode || null,
            establishmentCode: payload.establishmentCode,
            expeditionPointCode: payload.expeditionPointCode,
            series: payload.series || null,
            firstNumber: payload.firstNumber ?? null
        });
    }

    registerCertificateMetadata(tenantId: string, payload: SifenCertificateMetadataPayload): Observable<void> {
        return this.http.post<void>(`${this.onboardingUrl}/tenants/${tenantId}/certificates`, payload);
    }

    getSifenConfig(tenantId: string): Observable<SifenConfigModel> {
        return this.http.get<any>(`${this.apiUrl}/platform/companies/${tenantId}/sifen-config`).pipe(
            map((config) => this.mapSifenConfig(config, tenantId))
        );
    }

    updateSifenConfig(tenantId: string, payload: SifenConfigModel): Observable<SifenConfigModel> {
        return this.http.put<any>(`${this.apiUrl}/platform/companies/${tenantId}/sifen-config`, {
            ruc: payload.ruc,
            rucCheckDigit: payload.rucCheckDigit,
            legalName: payload.legalName,
            environment: payload.environment,
            cscIdentifier: payload.cscIdentifier || null,
            cscSecretReference: payload.cscSecretReference,
            certificateSecretReference: payload.certificateSecretReference || null,
            certificatePasswordSecretReference: payload.certificatePasswordSecretReference || null,
            certificateAlias: payload.certificateAlias || null,
            establishment: payload.establishment,
            expeditionPoint: payload.expeditionPoint,
            currentNumber: payload.currentNumber,
            stampingNumber: payload.stampingNumber || null,
            xmlSchemaRootPath: payload.xmlSchemaRootPath || null,
            endpointUrl: payload.endpointUrl || null,
            transportMode: payload.transportMode
        }).pipe(
            map((config) => this.mapSifenConfig(config, tenantId))
        );
    }

    isSuperAdminRole(role?: string | null): boolean {
        const normalizedRole = this.normalizeRole(role);
        return ['SUPERADMIN', 'SUPER_ADMIN', 'ROOT', 'PLATFORM_ADMIN'].includes(normalizedRole);
    }

    isTenantAdminRole(role?: string | null): boolean {
        return this.normalizeRole(role) === 'TENANTADMIN';
    }

    isOperatorRole(role?: string | null): boolean {
        return this.normalizeRole(role) === 'OPERATOR';
    }

    isViewerRole(role?: string | null): boolean {
        return this.normalizeRole(role) === 'VIEWER';
    }

    canManageTenantUsers(user?: SessionUser | null): boolean {
        return this.isSuperAdminRole(user?.role) || this.isTenantAdminRole(user?.role);
    }

    canConfigureTenant(user?: SessionUser | null): boolean {
        return this.isSuperAdminRole(user?.role) || this.isTenantAdminRole(user?.role);
    }

    canIssueInvoices(user?: SessionUser | null): boolean {
        return this.isSuperAdminRole(user?.role) || this.isTenantAdminRole(user?.role) || this.isOperatorRole(user?.role);
    }

    canViewInvoices(user?: SessionUser | null): boolean {
        return this.canIssueInvoices(user) || this.isViewerRole(user?.role);
    }

    normalizeRole(role?: string | null): string {
        return String(role || '')
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '_');
    }

    getStatusSeverity(status?: string | null): 'success' | 'warning' | 'danger' | 'secondary' {
        const normalized = String(status || '').toUpperCase();
        if (['ACTIVE', 'ACTIVA', 'READY', 'LISTO'].includes(normalized)) {
            return 'success';
        }

        if (['PENDING', 'PENDIENTE', 'SETUP'].includes(normalized)) {
            return 'warning';
        }

        if (['INACTIVE', 'INACTIVA', 'ERROR', 'BLOCKED'].includes(normalized)) {
            return 'danger';
        }

        return 'secondary';
    }

    getErrorMessage(error: unknown, fallback: string): string {
        return extractApiErrorMessage(error, fallback);
    }

    private mapCompany(company: any): SifenCompanyDetail {
        return {
            tenantId: String(company?.tenantId ?? company?.id ?? ''),
            slug: String(company?.slug ?? ''),
            businessName: String(company?.businessName ?? company?.displayName ?? company?.name ?? company?.commercialName ?? ''),
            status: String(company?.status ?? company?.state ?? 'Unknown'),
            planName: company?.planName ?? company?.plan ?? null,
            invoiceLimitPerMonth: company?.invoiceLimitPerMonth ?? company?.maxInvoicesPerMonth ?? company?.monthlyInvoiceLimit ?? company?.planInvoiceLimit ?? null,
            userLimit: company?.userLimit ?? company?.maxUsers ?? company?.planUserLimit ?? null,
            createdAt: company?.createdAt ?? null,
            updatedAt: company?.updatedAt ?? null
        };
    }

    private mapSifenConfig(config: any, tenantId: string): SifenConfigModel {
        return {
            tenantId: String(config?.tenantId ?? tenantId),
            ruc: String(config?.ruc ?? ''),
            rucCheckDigit: String(config?.rucCheckDigit ?? ''),
            legalName: String(config?.legalName ?? config?.razonSocial ?? ''),
            environment: (config?.environment === 'Production' ? 'Production' : 'Test'),
            cscIdentifier: String(config?.cscIdentifier ?? ''),
            cscSecretReference: String(config?.cscSecretReference ?? ''),
            certificateSecretReference: String(config?.certificateSecretReference ?? ''),
            certificatePasswordSecretReference: String(config?.certificatePasswordSecretReference ?? ''),
            certificateAlias: String(config?.certificateAlias ?? ''),
            establishment: String(config?.establishment ?? ''),
            expeditionPoint: String(config?.expeditionPoint ?? ''),
            currentNumber: String(config?.currentNumber ?? ''),
            stampingNumber: String(config?.stampingNumber ?? ''),
            xmlSchemaRootPath: String(config?.xmlSchemaRootPath ?? ''),
            endpointUrl: String(config?.endpointUrl ?? ''),
            transportMode: config?.transportMode === 'Live' ? 'Live' : 'Diagnostic',
            readySummary: config?.readySummary ?? null
        };
    }

    private mapCompanyUsers(result: any): SifenCompanyUsersResult {
        return {
            tenantId: String(result?.tenantId ?? ''),
            companyName: String(result?.companyName ?? result?.displayName ?? ''),
            planName: String(result?.planName ?? 'Plan base'),
            activeUsers: Number(result?.activeUsers ?? 0),
            maxUsers: result?.maxUsers ?? null,
            users: Array.isArray(result?.users) ? result.users.map((user: any) => this.mapTenantUser(user)) : []
        };
    }

    private mapTenantUser(user: any): SifenTenantUserSummary {
        return {
            userId: String(user?.userId ?? user?.id ?? ''),
            tenantId: String(user?.tenantId ?? ''),
            fullName: String(user?.fullName ?? user?.displayName ?? ''),
            email: String(user?.email ?? ''),
            role: String(user?.role ?? ''),
            isActive: Boolean(user?.isActive ?? user?.active)
        };
    }

    private mapKudeTemplate(settings: any, tenantId: string): SifenKudeTemplateSettings {
        return {
            tenantId: String(settings?.tenantId ?? tenantId),
            templateCode: String(settings?.templateCode ?? 'codexa-standard'),
            logoUrl: settings?.logoUrl ?? null,
            primaryColor: String(settings?.primaryColor ?? '#2D9CDB'),
            secondaryColor: String(settings?.secondaryColor ?? '#EAF6FD'),
            footerText: String(settings?.footerText ?? 'Consulte este comprobante en la SET'),
            showPhone: Boolean(settings?.showPhone ?? true),
            showEmail: Boolean(settings?.showEmail ?? true)
        };
    }

    private getFileName(headers: any): string | null {
        const disposition = headers.get('content-disposition');
        if (!disposition) {
            return null;
        }

        const match = disposition.match(/filename=\"?([^\"]+)\"?/i);
        return match?.[1] ?? null;
    }

    private buildTenantHeaders(): HttpHeaders {
        const tenantId = this.getActiveTenantId();
        return tenantId
            ? new HttpHeaders({ 'X-Tenant-Id': tenantId })
            : new HttpHeaders();
    }

    private buildTenantHeadersFor(tenantId: string): HttpHeaders {
        return tenantId
            ? new HttpHeaders({ 'X-Tenant-Id': tenantId })
            : new HttpHeaders();
    }

    getSessionUser(): SessionUser | null {
        return this.authService.getSession();
    }

    setSelectedTenant(tenantId: string): void {
        if (tenantId?.trim()) {
            localStorage.setItem(this.selectedTenantKey, tenantId.trim());
        }
    }

    clearSelectedTenant(): void {
        localStorage.removeItem(this.selectedTenantKey);
    }

    getActiveTenantId(): string | null {
        const session = this.getSessionUser();
        const sessionTenantId = session?.tenantId != null ? String(session.tenantId).trim() : '';
        if (sessionTenantId && sessionTenantId !== '0') {
            return sessionTenantId;
        }

        const sessionCompanyId = session?.companyId != null ? String(session.companyId).trim() : '';
        if (sessionCompanyId && sessionCompanyId !== '0') {
            return sessionCompanyId;
        }

        const selectedTenant = localStorage.getItem(this.selectedTenantKey)?.trim() || '';
        return selectedTenant || null;
    }

    hasTenantContext(): boolean {
        return !!this.getActiveTenantId();
    }
}
