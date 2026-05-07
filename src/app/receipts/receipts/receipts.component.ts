import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WmsService } from 'src/app/layout/service/wms.service';
import { Table } from 'primeng/table';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './receipts.component.html'
})
export class ReceiptsComponent implements OnInit {

  receipts: any[] = [];
  loading = true;
  totalRecords = 0;

  @ViewChild('filter') filter!: ElementRef;

  constructor(private wmsService: WmsService,
      private router: Router,private route: ActivatedRoute
    ) {}

  ngOnInit(): void {
    this.wmsService.getReceiptHeaders().subscribe({
      next: (response: any) => {
        this.receipts = response.data;
        this.totalRecords = response.totalRecords;
        this.loading = false;

        console.log(response.data);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal(
      (event.target as HTMLInputElement).value,
      'contains'
    );
  }

  openReceipt(receipt: any) {
  console.log('Receipt seleccionado:', receipt);

  this.router.navigate(
    ['details', receipt.id],
    { relativeTo: this.route }
  );
}
}