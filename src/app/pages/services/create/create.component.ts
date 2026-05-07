import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ServicesService, CreateServiceRequest } from '../services/services.service';
import { SERVICE_CATEGORY_OPTIONS } from '../services/service-categories';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  readonly categoryOptions = SERVICE_CATEGORY_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(500)]],
      referenceCode: ['', [Validators.maxLength(50)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      cost: [0, [Validators.min(0)]],
      estimatedTimeText: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['', [Validators.required]],
      permiteAdjunto: [false]
    });
  }

  /* =========================
     VALIDACIONES EXTRA
  ========================= */
  private validateBusinessRules(): boolean {

    const price = Number(this.form.value.price);
    const cost = Number(this.form.value.cost);

    if (cost > price) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validacion',
        detail: 'El costo no puede ser mayor al precio'
      });
      return false;
    }

    return true;
  }

  /* =========================
     SUBMIT
  ========================= */
  submit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Revise los campos obligatorios, incluida la categoria'
      });

      return;
    }

    if (!this.validateBusinessRules()) return;

    this.loading = true;

    const payload: CreateServiceRequest = {
      name: this.form.value.name?.trim(),
      description: this.form.value.description?.trim(),
      referenceCode: this.form.value.referenceCode?.trim(),
      price: Number(this.form.value.price),
      cost: Number(this.form.value.cost),
      estimatedTimeText: this.form.value.estimatedTimeText?.trim(),
      category: this.form.value.category,
      permiteAdjunto: !!this.form.value.permiteAdjunto
    };

    this.servicesService.create(payload)
      .subscribe({
        next: () => {

          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'Servicio creado correctamente'
          });

          this.loading = false;

          this.router.navigate(['/dashboard/services']);
        },
        error: (err) => {

          this.loading = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al crear servicio'
          });
        }
      });
  }

  /* =========================
     HELPERS UI
  ========================= */
  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  /* =========================
     NAV
  ========================= */
  goBack() {
    this.router.navigate(['/dashboard/services']);
  }
}
