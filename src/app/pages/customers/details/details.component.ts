import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CustomersService, PortalUser } from '../services/customers.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  providers: [MessageService]
})
export class DetailsComponent implements OnInit {
  customer?: PortalUser;
  loading = false;
  id!: number;

  constructor(
    private route: ActivatedRoute,
    private service: CustomersService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.loading = true;

    this.service.getById(this.id).subscribe({
      next: (response) => {
        this.customer = response;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el usuario.'
        });
      }
    });
  }

  toggleStatus() {
    this.service.inactivate(this.id).subscribe({
      next: () => {
        if (this.customer) {
          this.customer.isActive = !this.customer.isActive;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Estado actualizado',
          detail: 'Se actualizo el estado del usuario.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cambiar el estado del usuario.'
        });
      }
    });
  }

  back() {
    this.router.navigate(['/dashboard/customers']);
  }
}
