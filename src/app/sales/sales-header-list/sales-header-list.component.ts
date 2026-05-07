import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales-header-list',
  templateUrl: './sales-header-list.component.html',
  styleUrls: ['./sales-header-list.component.scss']
})
export class SalesHeaderListComponent {

  salesOrders: any[] = []; // vacio
  loading: boolean = false;

  constructor(private router: Router) {}

  onGlobalFilter(table: any, event: Event) {
    const input = event.target as HTMLInputElement;
    table.filterGlobal(input.value, 'contains');
  }

  clear(table: any) {
    table.clear();
  }

  goToDetail(s: any) {
    this.router.navigate([
      '/sales-orders',
      s.companyId,
      s.documentType,
      s.no
    ]);
  }

}