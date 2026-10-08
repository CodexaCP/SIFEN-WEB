import { Component } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import {
    FeCreateInvoiceResult,
    FeInvoiceApiService,
    FeInvoiceCatalogs,
    FeReceiverDocumentType,
    FePlanSummary,
    FePrepareTestResult
} from '../services/fe-invoice-api.service';
import { SifenDiagnosticResult, SifenPlatformService } from '../services/sifen-platform.service';
import { SifenKudePreviewModel } from '../kude-preview/sifen-kude-preview.component';

type VatType = '10%' | '5%' | 'EXENTA';

@Component({
    selector: 'app-fe-issue',
    templateUrl: './fe-issue.component.html',
    styleUrls: ['./fe-issue.component.scss']
})
export class FeIssueComponent {
    readonly form = this.formBuilder.group({
        saleCondition: ['Contado', Validators.required],
        currency: ['PYG', Validators.required],
        transactionType: [null as number | null, Validators.required],
        presenceIndicator: [null as number | null, Validators.required],
        receiverDocumentType: ['Ruc' as FeReceiverDocumentType, Validators.required],
        receiverTaxpayerKind: [null as number | null],
        customerName: ['', Validators.required],
        customerDocument: ['', Validators.required],
        customerAddress: [''],
        customerEmail: ['', Validators.email],
        customerPhone: [''],
        items: this.formBuilder.array([this.createItemGroup()])
    });

    readonly vatOptions: VatType[] = ['10%', '5%', 'EXENTA'];
    readonly currencies = ['PYG', 'USD'];
    readonly saleConditions = ['Contado', 'Crédito'];
    catalogs?: FeInvoiceCatalogs;
    catalogError = '';

    submitted = false;
    submitting = false;
    submitError = '';
    planSummary?: FePlanSummary;
    planMessage = '';
    diagnostic?: SifenDiagnosticResult;
    activeTenantId: string | null;
    currentStep = 1;
    createdInvoice?: FeCreateInvoiceResult;
    prepareResult?: FePrepareTestResult;
    private idempotencyKey: string | null = null;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly feInvoiceApiService: FeInvoiceApiService,
        private readonly router: Router,
        private readonly sifenPlatformService: SifenPlatformService
    ) {
        this.activeTenantId = this.sifenPlatformService.getActiveTenantId();
        this.form.valueChanges.subscribe(() => {
            if (!this.submitting) {
                this.idempotencyKey = null;
            }
        });
        this.loadPlanSummary();
        this.loadDiagnostic();
        this.loadCatalogs();
    }

    get items(): FormArray {
        return this.form.get('items') as FormArray;
    }

    get subtotal(): number {
        return this.items.controls.reduce((sum, control) => sum + this.getRowSubtotal(control.value), 0);
    }

    get vatTotal(): number {
        return this.items.controls.reduce((sum, control) => {
            const row = control.value;
            const subtotal = this.getRowSubtotal(row);
            return sum + this.calculateVatAmount(subtotal, row?.vatType);
        }, 0);
    }

    get total(): number {
        return this.subtotal;
    }

    get itemCount(): number {
        return this.items.length;
    }

    get canContinue(): boolean {
        if (this.currentStep === 1) {
            return this.isStepOneValid;
        }

        if (this.currentStep === 2) {
            return this.items.valid && this.items.length > 0;
        }

        return true;
    }

    get isStepOneValid(): boolean {
        const requiredKeys = [
            'saleCondition',
            'currency',
            'transactionType',
            'presenceIndicator',
            'receiverDocumentType',
            'customerName',
            'customerDocument',
            'customerEmail'
        ];
        const taxpayerKindReady = this.form.get('receiverDocumentType')?.value !== 'Ruc' || this.form.get('receiverTaxpayerKind')?.value != null;

        return taxpayerKindReady && requiredKeys.every((key) => this.form.get(key)?.valid);
    }

    get isDiagnosticBlocked(): boolean {
        return !!this.activeTenantId && !!this.diagnostic && this.diagnostic.globalStatus === 'BLOCKED';
    }

    get canIssueInvoices(): boolean {
        return this.sifenPlatformService.canIssueInvoices(this.sifenPlatformService.getSessionUser());
    }

    get isReadOnlyMode(): boolean {
        return this.planSummary?.active === false;
    }

    get expectedStatusLabel(): string {
        if (this.prepareResult?.internalStatus) {
            return this.prepareResult.internalStatus;
        }

        return 'VALIDATED_TEST';
    }

    get resultSeverityClass(): string {
        switch (this.prepareResult?.internalStatus) {
            case 'VALIDATED_TEST':
                return 'is-success';
            case 'BLOCKED_BY_CONFIG':
                return 'is-warning';
            case 'TEST_ERROR':
                return 'is-danger';
            default:
                return '';
        }
    }

    get resultTitle(): string {
        switch (this.prepareResult?.internalStatus) {
            case 'VALIDATED_TEST':
                return 'Factura preparada correctamente en entorno TEST.';
            case 'BLOCKED_BY_CONFIG':
                return 'La factura quedó bloqueada por configuración pendiente.';
            case 'TEST_ERROR':
                return 'La factura tuvo un error durante la preparación TEST.';
            default:
                return 'Resultado TEST';
        }
    }

    get previewModel(): SifenKudePreviewModel {
        const raw = this.form.getRawValue();
        return {
            businessName: 'Codexa FE TEST',
            ruc: '80000000-0',
            address: 'Asunción, Paraguay',
            phone: raw.customerPhone || '+595 981 000000',
            email: raw.customerEmail || 'facturacion@test.codexa',
            establishment: '',
            expeditionPoint: '',
            documentNumber: '',
            issueDate: this.todayIso(),
            customerName: raw.customerName || 'Cliente de prueba',
            customerDocument: raw.customerDocument || '0000000',
            customerAddress: raw.customerAddress || 'Sin dirección cargada',
            saleCondition: raw.saleCondition || 'Contado',
            items: this.items.controls.map((control) => {
                const value = control.value;
                return {
                    description: value?.description || 'Ítem',
                    quantity: Number(value?.quantity || 0),
                    unitPrice: Number(value?.unitPrice || 0),
                    vatLabel: value?.vatType || '10%',
                    subtotal: this.getRowSubtotal(value)
                };
            }),
            subtotal: this.subtotal,
            vatTotal: this.vatTotal,
            total: this.total,
            totalInWords: this.toSpanishAmount(this.total),
            observations: 'Operación de prueba generada en el entorno interno SIFEN.',
            fakeCdc: this.buildFakeCdc()
        };
    }

    addItem(): void {
        this.items.push(this.createItemGroup());
    }

    removeItem(index: number): void {
        if (this.items.length === 1) {
            return;
        }

        this.items.removeAt(index);
    }

    rowSubtotal(index: number): number {
        return this.getRowSubtotal(this.items.at(index).value);
    }

    nextStep(): void {
        if (!this.canContinue) {
            this.submitted = true;
            this.form.markAllAsTouched();
            return;
        }

        this.currentStep = Math.min(4, this.currentStep + 1);
    }

    previousStep(): void {
        this.currentStep = Math.max(1, this.currentStep - 1);
    }

    goToStep(step: number): void {
        if (step < 1 || step > 4) {
            return;
        }

        if (step > this.currentStep && !this.canContinue) {
            this.submitted = true;
            this.form.markAllAsTouched();
            return;
        }

        this.currentStep = step;
    }

    cancel(): void {
        this.router.navigate(['/sifen/invoices']);
    }

    submit(): void {
        this.submitError = '';
        this.submitted = true;

        if (!this.canIssueInvoices) {
            this.submitError = 'Tu rol actual no puede emitir facturas.';
            return;
        }

        if (this.isReadOnlyMode) {
            this.submitError = 'El tenant está en solo lectura por estado del plan.';
            return;
        }

        if (!this.activeTenantId) {
            this.submitError = 'No se pudo resolver el tenant activo para esta emisión TEST.';
            return;
        }

        if (this.isDiagnosticBlocked) {
            this.submitError = 'Falta configuración del tenant. Revisa el diagnóstico antes de preparar la factura.';
            return;
        }

        if (this.form.invalid || this.items.invalid || this.items.length === 0) {
            this.form.markAllAsTouched();
            this.submitError = 'Completa los datos requeridos y al menos un ítem válido.';
            return;
        }

        const raw = this.form.getRawValue();
        this.submitting = true;
        this.prepareResult = undefined;
        this.createdInvoice = undefined;
        this.idempotencyKey ??= this.feInvoiceApiService.newIdempotencyKey();

        this.feInvoiceApiService.create({
            saleCondition: raw.saleCondition ?? '',
            currencyCode: raw.currency ?? '',
            transactionType: raw.transactionType ?? null,
            presenceIndicator: raw.presenceIndicator ?? null,
            receiverDocumentType: raw.receiverDocumentType ?? 'Ruc',
            receiverTaxpayerKind: raw.receiverTaxpayerKind ?? null,
            customerName: raw.customerName ?? '',
            customerDocument: raw.customerDocument ?? '',
            customerAddress: raw.customerAddress ?? '',
            customerEmail: raw.customerEmail ?? '',
            customerPhone: raw.customerPhone ?? '',
            items: (raw.items ?? []).map((item) => ({
                code: item?.code ?? '',
                unitCode: item?.unitCode ?? undefined,
                description: item?.description ?? '',
                quantity: Number(item?.quantity ?? 0),
                unitPrice: Number(item?.unitPrice ?? 0),
                vatRate: this.toVatRate(item?.vatType)
            }))
        }, this.idempotencyKey).pipe(
            switchMap((invoice) => {
                this.createdInvoice = invoice;
                this.idempotencyKey = null;
                return this.feInvoiceApiService.prepareTest(invoice.id).pipe(
                    catchError((error) => {
                        this.submitError = this.feInvoiceApiService.getErrorMessage(error, 'La factura se creó pero falló la preparación TEST.');
                        return of(null);
                    }),
                    switchMap((result) => of({ invoice, result }))
                );
            })
        ).subscribe({
            next: ({ invoice, result }) => {
                this.submitting = false;
                this.createdInvoice = invoice;
                this.prepareResult = result ?? undefined;
                this.currentStep = 4;
            },
            error: (error) => {
                this.submitting = false;
                this.createdInvoice = undefined;
                this.prepareResult = undefined;
                this.submitError = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo crear la factura TEST.');
            }
        });
    }

    openDetail(): void {
        if (!this.createdInvoice) {
            return;
        }

        this.router.navigate(['/sifen/invoices', this.createdInvoice.id]);
    }

    goToList(): void {
        this.router.navigate(['/sifen/invoices']);
    }

    startNewInvoice(): void {
        this.form.reset({
            saleCondition: 'Contado',
            currency: 'PYG',
            transactionType: null,
            presenceIndicator: null,
            receiverDocumentType: 'Ruc',
            receiverTaxpayerKind: null,
            customerName: '',
            customerDocument: '',
            customerAddress: '',
            customerEmail: '',
            customerPhone: ''
        });

        while (this.items.length > 0) {
            this.items.removeAt(0);
        }

        this.items.push(this.createItemGroup());
        this.currentStep = 1;
        this.submitted = false;
        this.submitting = false;
        this.submitError = '';
        this.createdInvoice = undefined;
        this.prepareResult = undefined;
        this.idempotencyKey = null;
    }

    fieldError(controlName: string, label: string): string {
        const control = this.form.get(controlName);
        if (!this.submitted && !control?.touched) {
            return '';
        }

        if (control?.hasError('required')) {
            return `${label} es obligatorio.`;
        }

        if (control?.hasError('email')) {
            return `Ingresa un email válido.`;
        }

        return '';
    }

    itemError(index: number, controlName: 'description' | 'quantity' | 'unitPrice', label: string): string {
        const control = this.items.at(index).get(controlName);
        if (!this.submitted && !control?.touched) {
            return '';
        }

        if (control?.hasError('required')) {
            return `${label} es obligatorio.`;
        }

        if (control?.hasError('min')) {
            return `${label} debe ser mayor a 0.`;
        }

        return '';
    }

    private loadPlanSummary(): void {
        if (!this.activeTenantId) {
            this.planMessage = 'Falta tenant. Selecciona una compañía antes de emitir.';
            return;
        }

        this.feInvoiceApiService.getPlanSummary(this.activeTenantId).subscribe({
            next: (summary) => {
                this.planSummary = summary;
                this.planMessage = summary.active ? '' : 'Plan vencido';
            },
            error: (error) => {
                this.planSummary = undefined;
                this.planMessage = this.feInvoiceApiService.getErrorMessage(error, 'No se pudo validar el plan FE del tenant.');
            }
        });
    }

    private loadDiagnostic(): void {
        if (!this.activeTenantId) {
            return;
        }

        this.sifenPlatformService.getDiagnostic(this.activeTenantId).subscribe({
            next: (diagnostic) => {
                this.diagnostic = diagnostic;
            },
            error: () => {
                this.diagnostic = undefined;
            }
        });
    }

    private loadCatalogs(): void {
        this.feInvoiceApiService.getCatalogs().subscribe({
            next: (catalogs) => {
                this.catalogs = catalogs;
                this.catalogError = '';
            },
            error: (error) => {
                this.catalogError = this.feInvoiceApiService.getErrorMessage(error, 'No se pudieron cargar los catálogos de emisión.');
            }
        });
    }

    private createItemGroup() {
        return this.formBuilder.group({
            code: ['', Validators.required],
            unitCode: [null as number | null, Validators.required],
            description: ['Servicio demo FE', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [100000, [Validators.required, Validators.min(1)]],
            vatType: ['10%' as VatType, Validators.required]
        });
    }

    private getRowSubtotal(row: any): number {
        return Number(row?.quantity || 0) * Number(row?.unitPrice || 0);
    }

    private calculateVatAmount(subtotal: number, vatType?: VatType): number {
        if (vatType === '10%') {
            return subtotal / 11;
        }

        if (vatType === '5%') {
            return subtotal / 21;
        }

        return 0;
    }

    private toVatRate(vatType?: VatType | null): number {
        if (vatType === '5%') {
            return 5;
        }

        if (vatType === 'EXENTA') {
            return 0;
        }

        return 10;
    }

    private todayIso(): string {
        return new Date().toISOString().slice(0, 10);
    }

    private buildFakeCdc(): string {
        const tenantSeed = (this.activeTenantId || 'TEST').replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase();
        return `CDC-TEST-${tenantSeed}-0000000-${this.todayIso().replace(/-/g, '')}`;
    }

    private toSpanishAmount(value: number): string {
        return `Gs. ${Math.round(value).toLocaleString('es-PY')} con 00/100 en entorno TEST`;
    }
}
