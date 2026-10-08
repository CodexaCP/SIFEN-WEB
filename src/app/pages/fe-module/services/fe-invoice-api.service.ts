import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SifenPlatformService } from './sifen-platform.service';

export type FeInvoiceStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'error' | 'validacion-interna' | 'validacion-interna-fallida' | 'borrador-validado-sin-firma';

// Valores exactos de SifenTransmissionState / SifenFiscalState del backend (JsonStringEnumConverter).
export type FeTransmissionState = 'NotSent' | 'Sending' | 'Delivered' | 'NotDelivered' | 'Indeterminate';
export type FeFiscalState = 'None' | 'Approved' | 'ApprovedWithObservations' | 'Rejected' | 'NotFoundInSifen';
type FeTagSeverity = 'success' | 'warning' | 'danger' | 'info' | 'secondary';

export interface FeInvoiceItem {
    lineNumber?: number;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate?: number;
    vatAmount?: number;
    exemptAmount?: number;
    subtotalAmount?: number;
    totalAmount?: number;
}

export interface FeInvoiceListItem {
    id: string;
    tenantId?: string;
    cdc: string | null;
    number: string;
    customerName: string;
    customerDocument?: string | null;
    total: number;
    currency?: string;
    issuedAt: string;
    updatedAt?: string | null;
    status: FeInvoiceStatus;
    internalStatus?: string;
    statusCode?: string | null;
    statusMessage?: string | null;
    canDownloadXml: boolean;
    canDownloadKude: boolean;
    canRetry: boolean;
    retryCount?: number;
    errorCode?: string | null;
    errorCategory?: string | null;
    userMessage?: string | null;
    suggestedAction?: string | null;
    isRetryable: boolean;
    correlationId?: string | null;
    lastErrorMessage?: string | null;
    transmissionState?: FeTransmissionState | null;
    fiscalState?: FeFiscalState | null;
}

export interface FeInvoiceDetail {
    id: string;
    cdc: string;
    testCdc: string;
    testQrText?: string | null;
    isFiscalPreviewValid: boolean;
    documentType: string;
    number: string;
    establishmentCode: string;
    expeditionPointCode: string;
    saleCondition: string;
    notes?: string | null;
    customerName: string;
    customerDocument: string;
    customerAddress?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;
    subtotalAmount: number;
    vat5Amount: number;
    vat10Amount: number;
    exemptAmount: number;
    totalVatAmount: number;
    total: number;
    currency: string;
    issuedAt: string;
    status: FeInvoiceStatus;
    statusCode?: string | null;
    statusMessage?: string | null;
    sifenTrackingId?: string | null;
    transmissionState?: FeTransmissionState | null;
    fiscalState?: FeFiscalState | null;
    errorCode?: string | null;
    errorCategory?: string | null;
    userMessage?: string | null;
    suggestedAction?: string | null;
    isRetryable: boolean;
    correlationId?: string | null;
    internalStatus: string;
    retryCount: number;
    lastErrorCode?: string | null;
    lastErrorMessage?: string | null;
    items: FeInvoiceItem[];
    xmlPayload: string;
    canRetry: boolean;
    events: FeInvoiceEventItem[];
    logs: FeInvoiceLogItem[];
    tenantLogs: FeTenantLogItem[];
}

export interface FeInvoiceEventItem {
    id: string;
    invoiceId: string;
    correlationId: string;
    previousStatus?: string | null;
    newStatus: string;
    eventType: string;
    message: string;
    technicalDetail?: string | null;
    createdAt: string;
}

export interface FeInvoiceLogItem {
    occurredAt: string;
    level: string;
    eventType: string;
    message: string;
    metadataJson?: string | null;
}

export interface FeTenantLogItem {
    id: string;
    tenantId: string;
    invoiceId?: string | null;
    correlationId?: string | null;
    level: string;
    source: string;
    message: string;
    technicalDetail?: string | null;
    createdAt: string;
}

export interface FeTenantInvoicePage {
    items: FeInvoiceListItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface FeInvoiceStatusResult {
    cdc: string;
    status: FeInvoiceStatus;
    statusCode?: string | null;
    statusMessage?: string | null;
    errorCode?: string | null;
    category?: string | null;
    userMessage?: string | null;
    suggestedAction?: string | null;
    isRetryable?: boolean;
    correlationId?: string | null;
    transmissionState?: FeTransmissionState | null;
    fiscalState?: FeFiscalState | null;
    sifenTrackingId?: string | null;
}

export interface FeCreateInvoicePayload {
    saleCondition: string;
    currencyCode: string;
    notes?: string;
    customerName: string;
    customerDocument: string;
    customerAddress?: string;
    customerEmail?: string;
    customerPhone?: string;
    items: FeInvoiceItem[];
}

export interface FeCreateInvoiceResult {
    id: string;
    invoiceId?: string;
    cdc: string;
    status: string;
    totalAmount: number;
    xmlPayload: string;
    signedXmlPayload?: string | null;
    statusCode?: string | null;
    statusMessage?: string | null;
    internalStatus?: string | null;
    correlationId?: string | null;
    message?: string | null;
}

export interface FeRetryInvoiceResult {
    id: string;
    cdc: string;
    status: string;
    statusCode?: string | null;
    statusMessage?: string | null;
    attemptedAt: string;
    attemptNumber: number;
}

export interface FePrepareTestResult {
    invoiceId: string;
    tenantId: string;
    correlationId: string;
    internalStatus: string;
    readyForTest: boolean;
    message: string;
}

export interface FePlanSummary {
    tenantId: string;
    active: boolean;
    usedInvoicesThisMonth: number;
    maxInvoicesPerMonth?: number | null;
    maxUsers?: number | null;
    usersUsed?: number | null;
    usersMessage?: string | null;
    limitReached: boolean;
}

export interface FeDownloadedFile {
    fileName: string;
    content: Blob;
}

export interface FeKudeDownloadResult {
    available: boolean;
    file?: FeDownloadedFile;
    message?: string;
    futurePath?: string;
}

interface InvoiceApiListItem {
    invoiceId?: string;
    tenantId?: string;
    invoiceNumber?: string;
    customerName?: string;
    totalAmount?: number;
    currency?: string;
    internalStatus?: string;
    correlationId?: string | null;
    retryCount?: number;
    isRetryable?: boolean;
    lastErrorMessage?: string | null;
    createdAt?: string;
    updatedAt?: string | null;
    cdc?: string | null;
    transmissionState?: FeTransmissionState | null;
    fiscalState?: FeFiscalState | null;
}

interface InvoiceApiDetail {
    id: string;
    cdc: string;
    testCdc: string;
    testQrText?: string | null;
    isFiscalPreviewValid: boolean;
    documentType: string;
    externalDocumentNumber: string;
    establishmentCode: string;
    expeditionPointCode: string;
    currencyCode: string;
    saleCondition: string;
    notes?: string | null;
    receiverName: string;
    receiverDocument: string;
    receiverAddress?: string | null;
    receiverEmail?: string | null;
    receiverPhone?: string | null;
    subtotalAmount: number;
    vat5Amount: number;
    vat10Amount: number;
    exemptAmount: number;
    totalVatAmount: number;
    totalAmount: number;
    status: string;
    statusCode?: string | null;
    statusMessage?: string | null;
    sifenTrackingId?: string | null;
    transmissionState?: FeTransmissionState | null;
    fiscalState?: FeFiscalState | null;
    errorCode?: string | null;
    errorCategory?: string | null;
    userMessage?: string | null;
    suggestedAction?: string | null;
    isRetryable?: boolean;
    correlationId?: string | null;
    internalStatus?: string | null;
    retryCount?: number | null;
    lastErrorCode?: string | null;
    lastErrorMessage?: string | null;
    issuedAt: string;
    xmlPayload: string;
    items?: Array<{
        lineNumber: number;
        description: string;
        quantity: number;
        unitPrice: number;
        vatRate: number;
        vatAmount: number;
        exemptAmount: number;
        subtotalAmount: number;
        totalAmount: number;
    }>;
    events?: FeInvoiceEventItem[];
    logs?: FeInvoiceLogItem[];
    tenantLogs?: FeTenantLogItem[];
}

interface KudePlaceholderResponse {
    available: boolean;
    message: string;
    futurePath: string;
}

interface CreateSimpleInvoiceRequest {
    notes?: string;
    receiverName: string;
    receiverDocument: string;
    receiverAddress?: string;
    receiverEmail?: string;
    receiverPhone?: string;
    currencyCode: string;
    saleCondition: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        vatRate?: number;
    }>;
}

@Injectable({ providedIn: 'root' })
export class FeInvoiceApiService {
    private readonly apiUrl = environment.apiUrl;
    private readonly serverUrl = environment.serverUrl;

    constructor(
        private readonly http: HttpClient,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    getTenantInvoices(filters: {
        tenantId: string;
        status?: string;
        customerName?: string;
        from?: string;
        to?: string;
        page?: number;
        pageSize?: number;
    }): Observable<FeTenantInvoicePage> {
        const params = new URLSearchParams();
        if (filters.status) {
            params.set('status', filters.status);
        }
        if (filters.customerName) {
            params.set('customerName', filters.customerName);
        }
        if (filters.from) {
            params.set('from', filters.from);
        }
        if (filters.to) {
            params.set('to', filters.to);
        }
        params.set('page', String(filters.page ?? 1));
        params.set('pageSize', String(filters.pageSize ?? 20));

        return this.http.get<{ items: InvoiceApiListItem[]; totalCount: number; page: number; pageSize: number; totalPages?: number }>(
            `${this.apiUrl}/fe/tenants/${filters.tenantId}/invoices?${params.toString()}`,
            { headers: this.buildTenantHeaders() }
        ).pipe(
            map(result => ({
                items: (result.items || []).map(item => this.mapTenantListItem(item)),
                totalCount: result.totalCount ?? 0,
                page: result.page ?? 1,
                pageSize: result.pageSize ?? 20,
                totalPages: result.totalPages ?? this.computeTotalPages(result.totalCount ?? 0, result.pageSize ?? 20)
            }))
        );
    }

    getInvoices(): Observable<FeInvoiceListItem[]> {
        const tenantId = this.sifenPlatformService.getActiveTenantId();
        if (!tenantId) {
            return of([]);
        }

        return this.getTenantInvoices({
            tenantId,
            page: 1,
            pageSize: 50
        }).pipe(
            map(result => result.items)
        );
    }

    getInvoiceById(id: string): Observable<FeInvoiceDetail> {
        return this.http.get<InvoiceApiDetail>(`${this.apiUrl}/fe/invoices/${id}`, {
            headers: this.buildTenantHeaders()
        }).pipe(
            map(item => this.mapDetail(item))
        );
    }

    getStatus(cdc: string): Observable<FeInvoiceStatusResult> {
        return this.http.get<FeInvoiceStatusResult>(`${this.apiUrl}/fe/invoices/status/${encodeURIComponent(cdc)}`, {
            headers: this.buildTenantHeaders()
        });
    }

    getEvents(id: string): Observable<FeInvoiceEventItem[]> {
        return this.http.get<FeInvoiceEventItem[]>(`${this.apiUrl}/fe/invoices/${id}/events`, {
            headers: this.buildTenantHeaders()
        });
    }

    /**
     * idempotencyKey identifica la operacion de emision: reutilizarla al repetir la misma operacion
     * y usar una nueva (newIdempotencyKey) para cada factura nueva o modificada.
     */
    create(payload: FeCreateInvoicePayload, idempotencyKey: string): Observable<FeCreateInvoiceResult> {
        return this.http.post<FeCreateInvoiceResult>(
            `${this.apiUrl}/fe/invoices`,
            this.buildCreateRequest(payload),
            {
                headers: this.buildTenantHeaders().set('Idempotency-Key', idempotencyKey)
            }
        );
    }

    newIdempotencyKey(): string {
        const cryptoApi = crypto as Crypto & { randomUUID?: () => string };
        if (typeof cryptoApi.randomUUID === 'function') {
            return cryptoApi.randomUUID();
        }

        const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    retry(id: string): Observable<FeRetryInvoiceResult> {
        return this.http.post<FeRetryInvoiceResult>(`${this.serverUrl}/invoice/${id}/retry`, {}, {
            headers: this.buildTenantHeaders()
        });
    }

    prepareTest(id: string): Observable<FePrepareTestResult> {
        return this.http.post<FePrepareTestResult>(`${this.apiUrl}/fe/invoices/${id}/prepare-test`, {}, {
            headers: this.buildTenantHeaders()
        });
    }

    getPlanSummary(tenantId?: string | null): Observable<FePlanSummary> {
        const resolvedTenantId = tenantId || this.sifenPlatformService.getActiveTenantId();
        return this.http.get<FePlanSummary>(`${this.apiUrl}/fe/plan/${resolvedTenantId}`);
    }

    downloadXml(id: string): Observable<FeDownloadedFile> {
        return this.http.get(`${this.apiUrl}/fe/invoices/${id}/xml`, {
            headers: this.buildTenantHeaders(),
            observe: 'response',
            responseType: 'blob'
        }).pipe(
            map(response => ({
                fileName: this.getFileName(response.headers) ?? `fe-${id}.xml`,
                content: response.body ?? new Blob([], { type: 'application/xml' })
            }))
        );
    }

    downloadKude(id: string): Observable<FeKudeDownloadResult> {
        return this.http.get(`${this.apiUrl}/fe/invoices/${id}/kude`, {
            headers: this.buildTenantHeaders(),
            observe: 'response',
            responseType: 'blob'
        }).pipe(
            switchMap(response => this.mapKudeResponse(id, response))
        );
    }

    getStatusSeverity(status: FeInvoiceStatus): 'success' | 'warning' | 'danger' | 'secondary' {
        switch (status) {
            case 'aprobado':
                return 'success';
            case 'rechazado':
                return 'danger';
            case 'error':
                return 'secondary';
            case 'validacion-interna':
                return 'warning';
            case 'validacion-interna-fallida':
                return 'danger';
            case 'borrador-validado-sin-firma':
                return 'warning';
            default:
                return 'warning';
        }
    }

    getStatusShortMessage(status: FeInvoiceStatus): string {
        switch (status) {
            case 'aprobado':
                return 'Estado del documento: aceptado. La aprobación fiscal se indica en el estado fiscal SIFEN.';
            case 'rechazado':
                return 'Rechazada. Revisa el motivo y corrige antes de reenviar.';
            case 'error':
                return 'Hubo un problema temporal o de configuracion.';
            case 'validacion-interna':
                return 'Modo prueba: validacion local completada.';
            case 'validacion-interna-fallida':
                return 'La validacion local se bloqueo antes del envio.';
            case 'borrador-validado-sin-firma':
                return 'Se genero el XML localmente, pero falta validacion completa.';
            default:
                return 'Pendiente de confirmacion.';
        }
    }

    getInternalStatusMessage(internalStatus?: string): string {
        switch (internalStatus) {
            case 'DRAFT':
                return 'Borrador interno. Aún no fue preparado.';
            case 'GENERATED':
                return 'Factura generada internamente.';
            case 'VALIDATED_TEST':
                return 'Factura validada en modo TEST interno.';
            case 'TEST_ERROR':
                return 'La factura tuvo un error durante la validación TEST.';
            case 'READY_FOR_REAL':
                return 'La factura está lista para pasar a validación real.';
            case 'BLOCKED_BY_CONFIG':
                return 'La factura está bloqueada porque falta configuración del tenant.';
            default:
                return 'Estado interno no definido.';
        }
    }

    getTransmissionStateLabel(state?: FeTransmissionState | null): string {
        switch (state) {
            case 'NotSent':
                return 'No enviado';
            case 'Sending':
                return 'Enviando';
            case 'Delivered':
                return 'Transmitido';
            case 'NotDelivered':
                return 'No transmitido';
            case 'Indeterminate':
                return 'Indeterminado';
            default:
                return state ?? 'No disponible';
        }
    }

    getTransmissionStateSeverity(state?: FeTransmissionState | null): FeTagSeverity {
        switch (state) {
            case 'Delivered':
                return 'info';
            case 'Sending':
                return 'warning';
            case 'Indeterminate':
            case 'NotDelivered':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getFiscalStateLabel(state?: FeFiscalState | null): string {
        switch (state) {
            case 'None':
                return 'Sin resultado fiscal';
            case 'Approved':
                return 'Aprobado por SIFEN';
            case 'ApprovedWithObservations':
                return 'Aprobado con observaciones';
            case 'Rejected':
                return 'Rechazado por SIFEN';
            case 'NotFoundInSifen':
                return 'No encontrado en SIFEN';
            default:
                return state ?? 'No disponible';
        }
    }

    getFiscalStateSeverity(state?: FeFiscalState | null): FeTagSeverity {
        switch (state) {
            case 'Approved':
                return 'success';
            case 'ApprovedWithObservations':
                return 'warning';
            case 'Rejected':
            case 'NotFoundInSifen':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getStatusQueryErrorMessage(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            switch (error.status) {
                case 401:
                    return 'Tu sesión no es válida o expiró. Vuelve a iniciar sesión.';
                case 403:
                    return 'No tienes autorización para consultar este documento.';
                case 404:
                    return 'No se encontró el documento dentro de tu alcance autorizado.';
            }
        }

        return 'Error técnico al consultar el estado por CDC. El estado mostrado no cambió; puedes volver a intentar.';
    }

    canRetryInvoice(status: FeInvoiceStatus, statusCode?: string | null): boolean {
        return status === 'error' && this.isTechnicalRetryCode(statusCode);
    }

    getErrorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) {
            const payload = error.error;
            if (payload && typeof payload === 'object') {
                const problem = payload as { userMessage?: string; suggestedAction?: string; detail?: string; title?: string; message?: string };
                return problem.userMessage || problem.suggestedAction || problem.detail || problem.message || problem.title || fallback;
            }

            if (typeof payload === 'string' && payload.trim()) {
                return payload;
            }

            return error.message || fallback;
        }

        return fallback;
    }

    private mapTenantListItem(item: InvoiceApiListItem): FeInvoiceListItem {
        const internalStatus = item.internalStatus ?? 'DRAFT';
        const simpleStatus = this.mapInternalStatusToSimpleStatus(internalStatus);
        return {
            id: item.invoiceId ?? '',
            tenantId: item.tenantId,
            cdc: item.cdc || null,
            number: item.invoiceNumber ?? '',
            customerName: item.customerName ?? '',
            customerDocument: null,
            total: item.totalAmount ?? 0,
            currency: item.currency ?? 'PYG',
            issuedAt: item.createdAt ?? '',
            updatedAt: item.updatedAt,
            status: simpleStatus,
            internalStatus,
            statusCode: null,
            statusMessage: item.lastErrorMessage,
            canDownloadXml: true,
            canDownloadKude: true,
            canRetry: Boolean(item.isRetryable) && this.allowsRetry(item.transmissionState),
            retryCount: item.retryCount ?? 0,
            isRetryable: Boolean(item.isRetryable),
            correlationId: item.correlationId,
            lastErrorMessage: item.lastErrorMessage,
            transmissionState: item.transmissionState ?? null,
            fiscalState: item.fiscalState ?? null
        };
    }

    private mapDetail(item: InvoiceApiDetail): FeInvoiceDetail {
        const simpleStatus = this.toSimpleStatus(item.status);
        return {
            id: item.id,
            cdc: item.cdc,
            testCdc: item.testCdc,
            testQrText: item.testQrText,
            isFiscalPreviewValid: Boolean(item.isFiscalPreviewValid),
            documentType: item.documentType,
            number: item.externalDocumentNumber,
            establishmentCode: item.establishmentCode,
            expeditionPointCode: item.expeditionPointCode,
            saleCondition: item.saleCondition,
            notes: item.notes,
            customerName: item.receiverName,
            customerDocument: item.receiverDocument,
            customerAddress: item.receiverAddress,
            customerEmail: item.receiverEmail,
            customerPhone: item.receiverPhone,
            subtotalAmount: item.subtotalAmount,
            vat5Amount: item.vat5Amount,
            vat10Amount: item.vat10Amount,
            exemptAmount: item.exemptAmount,
            totalVatAmount: item.totalVatAmount,
            total: item.totalAmount,
            currency: item.currencyCode,
            issuedAt: item.issuedAt,
            status: simpleStatus,
            statusCode: item.statusCode,
            statusMessage: item.statusMessage,
            sifenTrackingId: item.sifenTrackingId,
            transmissionState: item.transmissionState ?? null,
            fiscalState: item.fiscalState ?? null,
            errorCode: item.errorCode,
            errorCategory: item.errorCategory,
            userMessage: item.userMessage,
            suggestedAction: item.suggestedAction,
            isRetryable: Boolean(item.isRetryable),
            correlationId: item.correlationId,
            internalStatus: item.internalStatus ?? 'DRAFT',
            retryCount: item.retryCount ?? 0,
            lastErrorCode: item.lastErrorCode,
            lastErrorMessage: item.lastErrorMessage,
            items: (item.items ?? []).map(line => ({
                lineNumber: line.lineNumber,
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                vatRate: line.vatRate,
                vatAmount: line.vatAmount,
                exemptAmount: line.exemptAmount,
                subtotalAmount: line.subtotalAmount,
                totalAmount: line.totalAmount
            })),
            xmlPayload: item.xmlPayload,
            canRetry: (Boolean(item.isRetryable) || this.canRetryInvoice(simpleStatus, item.statusCode))
                && this.allowsRetry(item.transmissionState),
            events: item.events ?? [],
            logs: item.logs ?? [],
            tenantLogs: item.tenantLogs ?? []
        };
    }

    private mapInternalStatusToSimpleStatus(internalStatus: string): FeInvoiceStatus {
        switch (internalStatus) {
            case 'VALIDATED_TEST':
            case 'READY_FOR_REAL':
                return 'validacion-interna';
            case 'TEST_ERROR':
                return 'error';
            case 'BLOCKED_BY_CONFIG':
                return 'validacion-interna-fallida';
            default:
                return 'pendiente';
        }
    }

    // Replica MapSimpleStatus del backend (InvoiceEndpoints.cs). InvoiceDetail.status llega como nombre del enum
    // SifenDocumentStatus; los pares listados son nombres declarados en el backend con el mismo valor numerico.
    private toSimpleStatus(status: string): FeInvoiceStatus {
        switch (status) {
            case 'InternalValidation':
                return 'validacion-interna';
            case 'InternalValidationFailed':
            case 'BlockedByConfiguration':
                return 'validacion-interna-fallida';
            case 'DraftValidatedWithoutSignature':
                return 'borrador-validado-sin-firma';
            case 'Accepted':
            case 'Approved':
                return 'aprobado';
            case 'Rejected':
                return 'rechazado';
            case 'Failed':
            case 'RetryableError':
                return 'error';
            default:
                return 'pendiente';
        }
    }

    private buildCreateRequest(payload: FeCreateInvoicePayload): CreateSimpleInvoiceRequest {
        return {
            notes: payload.notes?.trim() || undefined,
            receiverName: payload.customerName.trim(),
            receiverDocument: payload.customerDocument.trim(),
            receiverAddress: payload.customerAddress?.trim(),
            receiverEmail: payload.customerEmail?.trim(),
            receiverPhone: payload.customerPhone?.trim(),
            currencyCode: payload.currencyCode,
            saleCondition: payload.saleCondition,
            items: payload.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                vatRate: item.vatRate
            }))
        };
    }

    private mapKudeResponse(id: string, response: HttpResponse<Blob>): Observable<FeKudeDownloadResult> {
        const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
        if (!contentType.includes('application/json')) {
            return of({
                available: true,
                file: {
                    fileName: this.getFileName(response.headers) ?? `kude-${id}.pdf`,
                    content: response.body ?? new Blob([], { type: 'application/pdf' })
                }
            });
        }

        const rawBody = response.body;
        if (!rawBody) {
            return of({
                available: false,
                message: 'KuDE aun no disponible para esta factura.'
            });
        }

        return from(rawBody.text()).pipe(
            map(text => {
                const parsed = JSON.parse(text) as KudePlaceholderResponse;
                return {
                    available: parsed.available,
                    message: parsed.message,
                    futurePath: parsed.futurePath
                };
            })
        );
    }

    private getFileName(headers: HttpHeaders): string | null {
        const disposition = headers.get('content-disposition');
        if (!disposition) {
            return null;
        }

        const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
        return match?.[1] ?? null;
    }

    // El backend rechaza el reintento con transmision Indeterminate/Sending (requiere consulta por CDC).
    private allowsRetry(state?: FeTransmissionState | null): boolean {
        return state !== 'Indeterminate' && state !== 'Sending';
    }

    private isTechnicalRetryCode(statusCode?: string | null): boolean {
        if (!statusCode?.trim()) {
            return false;
        }

        const normalized = statusCode.trim().toUpperCase();
        return normalized.startsWith('HTTP_')
            || normalized === 'NO_RESPONSE'
            || normalized === 'PENDING_TRANSPORT'
            || normalized === 'SOAP_TIMEOUT'
            || normalized === 'SOAP_TRANSPORT_ERROR'
            || normalized === 'INVALID_RESPONSE'
            || normalized === 'UNPARSEABLE_RESPONSE'
            || normalized === 'TECHNICAL_ERROR'
            || normalized === 'DIAGNOSTIC_MODE_ENABLED'
            || normalized === 'MISSING_ENDPOINT_CONFIGURATION'
            || normalized === 'MISSING_CLIENT_CERTIFICATE_CONFIGURATION'
            || normalized === 'RETRY_RUNTIME_ERROR';
    }

    private buildTenantHeaders(): HttpHeaders {
        const tenantId = this.sifenPlatformService.getActiveTenantId();
        return tenantId
            ? new HttpHeaders({ 'X-Tenant-Id': tenantId })
            : new HttpHeaders();
    }

    private computeTotalPages(totalCount: number, pageSize: number): number {
        if (!totalCount || !pageSize) {
            return 0;
        }

        return Math.ceil(totalCount / pageSize);
    }
}
