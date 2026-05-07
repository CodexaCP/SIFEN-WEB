import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WmsService {
    private baseUrl = environment.apiUrl;
    private companyId = 'FC73E7BF-C62D-48FF-AC17-18244D67DFE4';

    constructor(private http: HttpClient) {}

    getBinById(id: string) {
        return this.http.get(`${this.baseUrl}/bins/${id}`);
    }

    getShipmentHeaders() {
        return this.http.get(`${this.baseUrl}/shipmentheaders`);
    }

    getReceiptHeaders() {
        return this.http.get(
            `${this.baseUrl}/ReceivingHeaders?companyId=${this.companyId}`,
        );
    }

    getReceiptById(id: string) {
        return this.http.get(`${this.baseUrl}/ReceivingHeaders/${id}`);
    }

    getPostedReceiptHeaderbyRHid(id: string, companyId: string) {
        return this.http.get<any[]>(
            `${this.baseUrl}/posted-receiving-headers/by-receiving/${id}?companyId=${companyId}`,
        );
    }

    getPostedReceiptLinebyLid(id: string, companyId: string) {
        return this.http.get<any[]>(
            `${this.baseUrl}/posted-receiving-lines/by-header/${id}?companyId=${companyId}`,
        );
    }

    getItemById(id: string) {
        return this.http.get(`${this.baseUrl}/items/${id}`);
    }

    getItems(pageNumber: number, pageSize: number, search?: string) {
        return this.http.get(
            `${this.baseUrl}/stock/enriched?companyId=${this.companyId}&pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search ?? ''}`,
        );
    }

    getDocument() {
        return this.http.get(
            `${this.baseUrl}/document_sequence?companyId=${this.companyId}`,
        );
    }

    createItem(item: any) {
        return this.http.post(
            `${this.baseUrl}/items/create_item?companyId=${this.companyId}`,
            item,
        );
    }

    updateItem(id: any, item: any) {
        return this.http.put(
            `${this.baseUrl}/items/${id}?companyId=${this.companyId}`,
            item,
        );
    }

    getInventoryMovements(
        pageNumber: number,
        pageSize: number,
        search?: string,
    ) {
        return this.http.get(
            `${this.baseUrl}/movements?companyId=${this.companyId}&pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search ?? ''}`,
        );
    }

    getMovements(
        id: any,
        pageNumber: number = 1,
        pageSize: number = 20,
        search?: string,
    ) {
        return this.http.get(
            `${this.baseUrl}/movements/item/${id}?companyId=${this.companyId}`,
        );
    }

    exportItems() {
        return this.http.get(
            `${this.baseUrl}/items/export?companyId=${this.companyId}`,
            { responseType: 'blob' },
        );
    }
    importItems(formData: FormData) {
        return this.http.post(
            `${this.baseUrl}/items/import?companyId=${this.companyId}`,
            formData,
        );
    }

    exportMovemnets() {
        return this.http.get(
            `${this.baseUrl}/movements/export?companyId=${this.companyId}`,
            { responseType: 'blob' },
        );
    }
    importMovemnets(formData: FormData) {
        return this.http.post(
            `${this.baseUrl}/movements/import?companyId=${this.companyId}`,
            formData,
        );
    }

    uploadImage(formData: FormData) {
        return this.http.post(`${this.baseUrl}/item-images/upload`, formData);
    }
}
