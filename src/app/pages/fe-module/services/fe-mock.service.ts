import { Injectable } from '@angular/core';

export interface FeInvoiceMockItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface FeInvoiceMock {
    id: string;
    cdc: string;
    number: string;
    customerName: string;
    customerDocument: string;
    issuedAt: string;
    total: number;
    status: 'pendiente' | 'aprobado' | 'rechazado' | 'error';
    items: FeInvoiceMockItem[];
}

export interface FeInvoiceCreateMock {
    customerName: string;
    customerDocument: string;
    total: number;
    items: FeInvoiceMockItem[];
}

@Injectable({ providedIn: 'root' })
export class FeMockService {
    private readonly invoices: FeInvoiceMock[] = [
        {
            id: 'fe-001',
            cdc: '01800123456001001000012311123456789202604251',
            number: '001-001-0000001',
            customerName: 'Cliente Demo',
            customerDocument: '80099999',
            issuedAt: '2026-04-28T09:00:00Z',
            total: 250000,
            status: 'aprobado',
            items: [
                { description: 'Licencia mensual', quantity: 1, unitPrice: 250000 }
            ]
        },
        {
            id: 'fe-002',
            cdc: '01800123456001001000012311123456789202604252',
            number: '001-001-0000002',
            customerName: 'Distribuidora Norte',
            customerDocument: '80111222',
            issuedAt: '2026-04-28T11:15:00Z',
            total: 180000,
            status: 'pendiente',
            items: [
                { description: 'Servicio de soporte', quantity: 1, unitPrice: 180000 }
            ]
        },
        {
            id: 'fe-003',
            cdc: '01800123456001001000012311123456789202604253',
            number: '001-001-0000003',
            customerName: 'Comercial Central',
            customerDocument: '80222333',
            issuedAt: '2026-04-27T15:30:00Z',
            total: 99000,
            status: 'rechazado',
            items: [
                { description: 'Mantenimiento', quantity: 1, unitPrice: 99000 }
            ]
        }
    ];

    getAll(): FeInvoiceMock[] {
        return [...this.invoices];
    }

    getById(id: string): FeInvoiceMock | undefined {
        return this.invoices.find(invoice => invoice.id === id);
    }

    buildXml(invoiceId: string): { fileName: string; content: string } | null {
        const invoice = this.getById(invoiceId);
        if (!invoice) {
            return null;
        }

        return {
            fileName: `fe-${invoice.number.replace(/[^0-9]/g, '')}.xml`,
            content: [
                '<rDE xmlns="http://ekuatia.set.gov.py/sifen/xsd">',
                `  <DE Id="${invoice.cdc}">`,
                `    <gDatGralOpe>`,
                `      <dFeEmiDE>${invoice.issuedAt}</dFeEmiDE>`,
                `    </gDatGralOpe>`,
                `    <gDatRec>`,
                `      <dNomRec>${invoice.customerName}</dNomRec>`,
                `      <dNumIDRec>${invoice.customerDocument}</dNumIDRec>`,
                `    </gDatRec>`,
                `    <gTotSub>`,
                `      <dTotGralOpe>${invoice.total}</dTotGralOpe>`,
                `    </gTotSub>`,
                '  </DE>',
                '</rDE>'
            ].join('\n')
        };
    }

    buildKudePlaceholder(invoiceId: string): { fileName: string; content: string } | null {
        const invoice = this.getById(invoiceId);
        if (!invoice) {
            return null;
        }

        return {
            fileName: `kude-${invoice.number.replace(/[^0-9]/g, '')}.txt`,
            content: [
                'KuDE mock de Codexa',
                `Factura: ${invoice.number}`,
                `CDC: ${invoice.cdc}`,
                `Cliente: ${invoice.customerName}`,
                'Estado: pendiente de integracion PDF real'
            ].join('\n')
        };
    }

    create(payload: FeInvoiceCreateMock): FeInvoiceMock {
        const sequence = (this.invoices.length + 1).toString().padStart(7, '0');
        const invoice: FeInvoiceMock = {
            id: `fe-${sequence}`,
            cdc: `018001234560010010000123111234567892026${sequence}`,
            number: `001-001-${sequence}`,
            customerName: payload.customerName.trim(),
            customerDocument: payload.customerDocument.trim(),
            issuedAt: new Date().toISOString(),
            total: payload.total,
            status: 'pendiente',
            items: payload.items.map(item => ({ ...item }))
        };

        this.invoices.unshift(invoice);
        return invoice;
    }
}
