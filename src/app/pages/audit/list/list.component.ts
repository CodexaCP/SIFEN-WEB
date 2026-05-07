import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '@core/service/auth.service';
import { AuditEventItem, AuditSearchRequest, AuditService } from '../services/audit.service';

@Component({
    selector: 'app-audit-list',
    templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
    items: AuditEventItem[] = [];
    loading = false;
    totalRows = 0;
    pageNumber = 1;
    pageSize = 20;

    dateFromUtc?: string;
    dateToUtc?: string;
    username?: string;
    companyName?: string;
    module?: string;
    action?: string;
    result?: string;
    severity?: string;
    visibility?: 'visible' | 'hidden' | 'all' = 'visible';

    canHide = false;
    isSuperAdmin = false;

    constructor(
        private readonly auditService: AuditService,
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.canHide = this.authService.isRole('SUPER_ADMIN');
        this.isSuperAdmin = this.authService.isRole('SUPER_ADMIN');
        this.load();
    }

    load(): void {
        this.loading = true;
        const request: AuditSearchRequest = {
            dateFromUtc: this.dateFromUtc ? new Date(`${this.dateFromUtc}T00:00:00Z`).toISOString() : null,
            dateToUtc: this.dateToUtc ? new Date(`${this.dateToUtc}T23:59:59Z`).toISOString() : null,
            username: this.username || null,
            companyName: this.companyName || null,
            module: this.module || null,
            action: this.action || null,
            result: this.result || null,
            severity: this.severity || null,
            isVisibleForAdmins: this.visibility === 'all' ? null : this.visibility === 'visible',
            pageNumber: this.pageNumber,
            pageSize: this.pageSize
        };

        this.auditService.search(request).subscribe({
            next: (response) => {
                this.items = response.data;
                this.totalRows = response.totalRows;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Auditoría',
                    detail: 'No se pudo cargar la auditoría.'
                });
            }
        });
    }

    clear(): void {
        this.pageNumber = 1;
        this.dateFromUtc = undefined;
        this.dateToUtc = undefined;
        this.username = undefined;
        this.companyName = undefined;
        this.module = undefined;
        this.action = undefined;
        this.result = undefined;
        this.severity = undefined;
        this.visibility = 'visible';
        this.load();
    }

    goDetail(item: AuditEventItem): void {
        if (item.source === 'legacy') {
            this.messageService.add({
                severity: 'info',
                summary: 'Auditoría',
                detail: 'El detalle avanzado solo está disponible para eventos PRO.'
            });
            return;
        }

        this.router.navigate(['/dashboard/audit', item.id]);
    }

    onPageChange(event: any): void {
        this.pageSize = event.rows ?? this.pageSize;
        this.pageNumber = ((event.first ?? 0) / this.pageSize) + 1;
        this.load();
    }

    toggleVisibility(item: AuditEventItem): void {
        if (item.source === 'legacy') {
            this.messageService.add({
                severity: 'info',
                summary: 'Auditoría',
                detail: 'Los eventos legacy no soportan ocultar/restaurar.'
            });
            return;
        }

        const request$ = item.isVisibleForAdmins
            ? this.auditService.hide(item.id)
            : this.auditService.unhide(item.id);

        request$.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Auditoría',
                    detail: item.isVisibleForAdmins ? 'Evento ocultado.' : 'Evento restaurado.'
                });
                this.load();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Auditoría',
                    detail: 'No se pudo actualizar la visibilidad.'
                });
            }
        });
    }

    severityClass(value: string): string {
        switch (value) {
            case 'Critical': return 'danger';
            case 'Error': return 'danger';
            case 'Warning': return 'warning';
            case 'Info': return 'info';
            default: return 'secondary';
        }
    }
}
