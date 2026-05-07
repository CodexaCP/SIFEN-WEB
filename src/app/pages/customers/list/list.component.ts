import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomersService, PortalUser } from '../services/customers.service';
import { AuthService } from '@core/service/auth.service';

type PortalUserView = PortalUser & { fullName: string };

@Component({
  selector: 'app-customers-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  users: PortalUserView[] = [];
  loading = false;
  search = '';
  selectedRole: string | null = null;
  selectedStatus: boolean | null = null;
  canManageUsers = false;

  roleOptions = [
    { label: 'Todos los roles', value: null },
    { label: 'Admin general', value: 'ADMIN_GENERAL' },
    { label: 'Gestor supremo', value: 'GESTOR_SUPREMO' },
    { label: 'Gestor', value: 'GESTOR' },
    { label: 'Customer', value: 'CUSTOMER' }
  ];

  statusOptions = [
    { label: 'Todos los estados', value: null },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false }
  ];

  constructor(
    private service: CustomersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.canManageUsers = this.authService.isRole('SUPER_ADMIN', 'ADMIN_GENERAL', 'GESTOR_SUPREMO', 'GESTOR');
    this.load();
  }

  load() {
    this.loading = true;

    this.service.getAll(this.search || undefined, this.selectedRole || undefined, this.selectedStatus).subscribe({
      next: (response) => {
        this.users = response.data.map((user) => ({
          ...user,
          fullName: `${user.firstName} ${user.lastName}`.trim()
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
  }

  openCustomer(user: PortalUserView) {
    this.router.navigate(['/dashboard/customers', user.userID]);
  }

  goCreate() {
    this.router.navigate(['/dashboard/customers/create']);
  }

  clear(table: any) {
    this.search = '';
    this.selectedRole = null;
    this.selectedStatus = null;
    table.clear();
    this.load();
  }

  onGlobalFilter(table: any, event: Event) {
    this.search = (event.target as HTMLInputElement).value;
    table.filterGlobal(this.search, 'contains');
    this.load();
  }

  onRoleChange() {
    this.load();
  }

  onStatusChange() {
    this.load();
  }

  toggleActive(user: PortalUserView) {
    this.service.inactivate(user.userID).subscribe(() => {
      user.isActive = !user.isActive;
    });
  }
}
