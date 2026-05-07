import { Component, Input } from '@angular/core';

export interface SifenKudePreviewItem {
    description: string;
    quantity: number;
    unitPrice: number;
    vatLabel: string;
    subtotal: number;
}

export interface SifenKudePreviewModel {
    businessName: string;
    ruc: string;
    address: string;
    phone: string;
    email: string;
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
    fakeCdc: string;
}

@Component({
    selector: 'app-sifen-kude-preview',
    templateUrl: './sifen-kude-preview.component.html',
    styleUrls: ['./sifen-kude-preview.component.scss']
})
export class SifenKudePreviewComponent {
    @Input() model!: SifenKudePreviewModel;

    get qrMatrix(): number[] {
        return Array.from({ length: 49 }, (_, index) => index);
    }

    isFilled(index: number): boolean {
        const seed = (index * 17) + this.model.fakeCdc.length;
        return seed % 3 !== 0;
    }
}
