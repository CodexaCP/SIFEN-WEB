import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AuditChange {
    id: number;
    auditEventId: number;
    fieldName: string;
    oldValue?: string | null;
    newValue?: string | null;
}

export interface AuditEventItem {
    id: number;
    source?: 'pro' | 'legacy';
    timestampUtc: string;
    userId?: number | null;
    username?: string | null;
    userEmail?: string | null;
    role?: string | null;
    companyId?: number | null;
    companyName?: string | null;
    action: string;
    module: string;
    entityName?: string | null;
    entityId?: string | null;
    correlationId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    result: string;
    severity: string;
    message?: string | null;
    isVisibleForAdmins: boolean;
    hiddenByUserId?: number | null;
    hiddenAtUtc?: string | null;
}

export interface AuditEventDetail extends AuditEventItem {
    changes: AuditChange[];
}

export interface PagedResponse<T> {
    totalRows: number;
    pageNumber: number;
    pageSize: number;
    data: T[];
}

export interface AuditSearchRequest {
    dateFromUtc?: string | null;
    dateToUtc?: string | null;
    userId?: number | null;
    companyId?: number | null;
    username?: string | null;
    companyName?: string | null;
    module?: string | null;
    action?: string | null;
    result?: string | null;
    severity?: string | null;
    isVisibleForAdmins?: boolean | null;
    correlationId?: string | null;
    pageNumber: number;
    pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
    private readonly baseUrl = `${environment.apiUrl}/v1/audit`;
    private readonly legacyUrl = `${environment.apiUrl}`.replace(/\/$/, '');

    constructor(private http: HttpClient) {}

    search(request: AuditSearchRequest): Observable<PagedResponse<AuditEventItem>> {
        return this.http.post<PagedResponse<AuditEventItem>>(`${this.baseUrl}/events/search`, request).pipe(
            switchMap((response) => {
                if (response.totalRows > 0) {
                    return of({
                        ...response,
                        data: response.data.map((item) => ({ ...item, source: 'pro' as const }))
                    });
                }

                return this.searchLegacy(request);
            }),
            catchError(() => this.searchLegacy(request))
        );
    }

    getById(id: number): Observable<AuditEventDetail> {
        return this.http.get<AuditEventDetail>(`${this.baseUrl}/events/${id}`);
    }

    hide(id: number) {
        return this.http.post(`${this.baseUrl}/${id}/hide`, {});
    }

    unhide(id: number) {
        return this.http.post(`${this.baseUrl}/${id}/unhide`, {});
    }

    private searchLegacy(request: AuditSearchRequest): Observable<PagedResponse<AuditEventItem>> {
        return this.http.post<any>(`${this.legacyUrl}/audit/logs`, {
            userID: request.userId ?? null,
            actionType: request.action ?? null,
            entityName: request.module ?? null,
            entityID: null,
            dateFrom: request.dateFromUtc ?? null,
            dateTo: request.dateToUtc ?? null,
            searchValue: request.username || null,
            pageNumber: request.pageNumber,
            pageSize: request.pageSize
        }).pipe(
            map((response) => {
                const result = response?.data;
                const mapped = (result?.data || []).map((item: any) => ({
                    id: item.auditID,
                    source: 'legacy' as const,
                    timestampUtc: item.createdAt,
                    userId: item.userID,
                    username: item.username,
                    companyName: item.companyName,
                    action: item.actionType,
                    module: item.entityName || 'AUDIT',
                    entityName: item.entityName,
                    entityId: String(item.entityID ?? ''),
                    correlationId: 'legacy',
                    result: 'Success',
                    severity: 'Info',
                    message: item.newValues || item.oldValues || null,
                    isVisibleForAdmins: true
                } as AuditEventItem));

                const filtered = mapped.filter((item: AuditEventItem) => {
                    const itemDate = item.timestampUtc ? new Date(item.timestampUtc) : null;
                    const fromDate = request.dateFromUtc ? new Date(request.dateFromUtc) : null;
                    const toDate = request.dateToUtc ? new Date(request.dateToUtc) : null;
                    const byFromDate = !fromDate || !itemDate || itemDate >= fromDate;
                    const byToDate = !toDate || !itemDate || itemDate <= toDate;
                    const byUsername = !request.username || (item.username || '').toLowerCase().includes(request.username.toLowerCase());
                    const byCompany = !request.companyName || (item.companyName || '').toLowerCase().includes(request.companyName.toLowerCase());
                    const byModule = !request.module || (item.module || '').toLowerCase().includes(request.module.toLowerCase());
                    const byAction = !request.action || (item.action || '').toLowerCase().includes(request.action.toLowerCase());
                    const byResult = !request.result || (item.result || '').toLowerCase() === request.result.toLowerCase();
                    const bySeverity = !request.severity || (item.severity || '').toLowerCase() === request.severity.toLowerCase();
                    return byFromDate && byToDate && byUsername && byCompany && byModule && byAction && byResult && bySeverity;
                });

                return {
                    totalRows: filtered.length,
                    pageNumber: request.pageNumber,
                    pageSize: request.pageSize,
                    data: filtered
                };
            })
        );
    }
}
