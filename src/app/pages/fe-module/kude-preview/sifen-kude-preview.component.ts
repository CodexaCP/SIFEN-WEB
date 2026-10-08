import { Component, Input } from '@angular/core';

export interface SifenKudePreviewItem {
    description: string;
    quantity: number;
    unitPrice: number;
    vatLabel: string;
    subtotal: number;
}

export interface SifenKudePreviewModel {
    /** Datos del emisor: solo los reales de la configuracion fiscal; si faltan, no se inventan. */
    businessName?: string | null;
    ruc?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    establishment: string;
    expeditionPoint: string;
    documentNumber: string;
    issueDate: string;
    customerName: string;
    customerDocument: string;
    customerAddress: string;
    saleCondition: string;
    items: SifenKudePreviewItem[];
    subtotal: number;
    vatTotal: number;
    total: number;
    totalInWords: string;
    observations: string;
    /** CDC real del documento; null mientras la factura no fue emitida. */
    cdc: string | null;
}

@Component({
    selector: 'app-sifen-kude-preview',
    templateUrl: './sifen-kude-preview.component.html',
    styleUrls: ['./sifen-kude-preview.component.scss']
})
export class SifenKudePreviewComponent {
    @Input() model!: SifenKudePreviewModel;
}
