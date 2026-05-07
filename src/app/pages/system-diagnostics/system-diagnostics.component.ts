import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription, timer } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ReadyStatus, RecentError, SystemDiagnosticsService, SystemMetrics, SystemResources, SystemStatus } from './system-diagnostics.service';

@Component({
    selector: 'app-system-diagnostics',
    templateUrl: './system-diagnostics.component.html'
})
export class SystemDiagnosticsComponent implements OnInit, OnDestroy {
    loading = false;
    autoRefreshSeconds = 15;
    status?: SystemStatus;
    ready?: ReadyStatus;
    metrics?: SystemMetrics;
    resources?: SystemResources;
    errors: RecentError[] = [];
    private refreshSub?: Subscription;

    constructor(
        private readonly diagnosticsService: SystemDiagnosticsService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadAll();
        this.refreshSub = timer(this.autoRefreshSeconds * 1000, this.autoRefreshSeconds * 1000).subscribe(() => this.loadAll(true));
    }

    ngOnDestroy(): void {
        this.refreshSub?.unsubscribe();
    }

    loadAll(silent = false): void {
        if (!silent) {
            this.loading = true;
        }

        forkJoin({
            ready: this.diagnosticsService.getReady(),
            status: this.diagnosticsService.getStatus(),
            metrics: this.diagnosticsService.getMetrics(),
            resources: this.diagnosticsService.getResources(),
            errors: this.diagnosticsService.getErrors(20)
        }).subscribe({
            next: (response) => {
                this.ready = response.ready;
                this.status = response.status;
                this.metrics = response.metrics;
                this.resources = response.resources;
                this.errors = response.errors;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Diagnóstico',
                    detail: 'No se pudo cargar el estado del sistema.'
                });
            }
        });
    }
}
