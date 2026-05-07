import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '@core/service/auth.service';
import { CompanyOption, CustomersService, InternalRegisterUserRequest } from '../services/customers.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  companies: CompanyOption[] = [];
  roleOptions: { label: string; value: string }[] = [];
  actorRole = '';
  isSuperAdmin = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomersService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.actorRole = this.authService.getSession()?.role ?? '';
    this.isSuperAdmin = this.actorRole === 'SUPER_ADMIN';
    this.roleOptions = this.getRoleOptions(this.actorRole);

    this.form = this.fb.group({
      username: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      roleName: [this.roleOptions[0]?.value ?? 'CUSTOMER', [Validators.required]],
      companyId: [null]
    });

    if (this.isSuperAdmin) {
      this.customerService.getCompanies().subscribe({
        next: (companies) => {
          this.companies = companies;
        },
        error: (error) => console.error(error)
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Completa usuario, nombre, apellido, telefono, email y rol antes de continuar.'
      });
      return;
    }

    if (this.isSuperAdmin && !this.form.value.companyId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Compania requerida',
        detail: 'Selecciona la compania donde se creara el usuario.'
      });
      return;
    }

    this.loading = true;

    const payload: InternalRegisterUserRequest = {
      username: this.form.value.username?.trim(),
      firstName: this.form.value.firstName?.trim(),
      lastName: this.form.value.lastName?.trim(),
      phone: this.form.value.phone?.trim(),
      email: this.form.value.email?.trim(),
      roleName: this.form.value.roleName,
      companyId: this.isSuperAdmin ? this.form.value.companyId : null
    };

    this.customerService.create(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario creado',
          detail: 'La contrasena inicial es 123456 y debera cambiarse en el primer ingreso.'
        });
        this.loading = false;
        this.router.navigate(['/dashboard/customers']);
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo registrar el usuario',
          detail: this.extractErrorMessage(error)
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/customers']);
  }

  private getRoleOptions(role: string) {
    if (role === 'SUPER_ADMIN') {
      return [
        { label: 'Admin general', value: 'ADMIN_GENERAL' },
        { label: 'Gestor supremo', value: 'GESTOR_SUPREMO' },
        { label: 'Gestor', value: 'GESTOR' },
        { label: 'Customer', value: 'CUSTOMER' }
      ];
    }

    if (role === 'ADMIN_GENERAL') {
      return [
        { label: 'Gestor supremo', value: 'GESTOR_SUPREMO' },
        { label: 'Gestor', value: 'GESTOR' },
        { label: 'Customer', value: 'CUSTOMER' }
      ];
    }

    if (role === 'GESTOR_SUPREMO') {
      return [
        { label: 'Gestor', value: 'GESTOR' },
        { label: 'Customer', value: 'CUSTOMER' }
      ];
    }

    return [
      { label: 'Customer', value: 'CUSTOMER' }
    ];
  }

  private extractErrorMessage(error: any): string {
    const apiError = error?.error;

    if (apiError?.error?.message) {
      return apiError.error.message;
    }

    if (apiError?.message) {
      return apiError.message;
    }

    if (apiError?.error) {
      return apiError.error;
    }

    if (error?.message) {
      return error.message;
    }

    return 'Verifica que el usuario o email no existan y que tengas permisos para crear ese rol.';
  }
}
