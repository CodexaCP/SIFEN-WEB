import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WmsService } from 'src/app/layout/service/wms.service';
import { Table } from 'primeng/table';



@Component({
  templateUrl: './shipments.component.html'
})
export class ShipmentsComponent implements OnInit {

  shipments: any[] = [];
  loading = true;
  totalRecords = 0;

  @ViewChild('filter') filter!: ElementRef;
  constructor(private wmsService: WmsService) {}

  ngOnInit(): void {
  this.wmsService.getShipmentHeaders().subscribe({
    next: (response: any) => {
      this.shipments = response.data;
      this.totalRecords = response.totalRecords;
      this.loading = false;
      console.log(response.data)
      
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
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    

    
}