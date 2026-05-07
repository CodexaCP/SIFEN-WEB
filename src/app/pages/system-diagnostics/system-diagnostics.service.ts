import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SystemStatus {
    status: string;
    environment: string;
    apiVersion: string;
    serverTimeUtc: string;
    uptimeSeconds: number;
}

export interface HealthComponent {
    name: string;
    status: string;
    message: string;
}

export interface ReadyStatus {
    status: string;
    timestampUtc: string;
    components: HealthComponent[];
}

export interface TopEndpoint {
    endpoint: string;
    count: number;
}

export interface SystemMetrics {
    requestsTotal: number;
    requestsPerMinute: number;
    avgResponseTimeMs: number;
    errorRate: number;
    activeRequests: number;
    topEndpoints: TopEndpoint[];
}

export interface SystemResources {
    cpuPercent: number;
    memoryUsedMb: number;
    threadCount: number;
    gen0Collections: number;
    gen1Collections: number;
    gen2Collections: number;
}

export interface RecentError {
    id: number;
    timestampUtc: string;
    module: string;
    action: string;
    severity: string;
    result: string;
    entityName?: string | null;
    entityId?: string | null;
    correlationId: string;
    message?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SystemDiagnosticsService {
    private readonly systemUrl = `${environment.apiUrl}/v1/system`;
    private readonly liveUrl = environment.serverUrl;

    constructor(private http: HttpClient) {}

    getLive(): Observable<any> {
        return this.http.get(`${this.liveUrl}/health/live`);
    }

    getReady(): Observable<ReadyStatus> {
        return this.http.get<ReadyStatus>(`${this.liveUrl}/health/ready`).pipe(
            catchError((error) => of(error?.error as ReadyStatus || {
                status: 'Error',
                timestampUtc: new Date().toISOString(),
                components: [
                    {
                        name: 'sqlserver',
                        status: 'Error',
                        message: 'No se pudo consultar el health check.'
                    }
                ]
            }))
        );
    }

    getStatus(): Observable<SystemStatus> {
        return this.http.get<SystemStatus>(`${this.systemUrl}/status`).pipe(
            catchError(() => of({
                status: 'Error',
                environment: 'N/A',
                apiVersion: 'N/A',
                serverTimeUtc: new Date().toISOString(),
                uptimeSeconds: 0
            }))
        );
    }

    getMetrics(): Observable<SystemMetrics> {
        return this.http.get<SystemMetrics>(`${this.systemUrl}/metrics`).pipe(
            catchError(() => of({
                requestsTotal: 0,
                requestsPerMinute: 0,
                avgResponseTimeMs: 0,
                errorRate: 0,
                activeRequests: 0,
                topEndpoints: []
            }))
        );
    }

    getResources(): Observable<SystemResources> {
        return this.http.get<SystemResources>(`${this.systemUrl}/resources`).pipe(
            catchError(() => of({
                cpuPercent: 0,
                memoryUsedMb: 0,
                threadCount: 0,
                gen0Collections: 0,
                gen1Collections: 0,
                gen2Collections: 0
            }))
        );
    }

    getErrors(limit = 20): Observable<RecentError[]> {
        const params = new HttpParams().set('limit', limit);
        return this.http.get<RecentError[]>(`${this.systemUrl}/errors`, { params }).pipe(
            catchError(() => of([]))
        );
    }
}
