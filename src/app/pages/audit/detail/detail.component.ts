import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuditEventDetail, AuditService } from '../services/audit.service';

@Component({
    selector: 'app-audit-detail',
    templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
    item?: AuditEventDetail;
    loading = false;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly auditService: AuditService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!id) {
            return;
        }

        this.loading = true;
        this.auditService.getById(id).subscribe({
            next: (response) => {
                this.item = response;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Auditoría',
                    detail: 'No se pudo cargar el detalle del evento.'
                });
            }
        });
    }
}
