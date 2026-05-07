import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WmsService } from 'src/app/layout/service/wms.service';
import { Table } from 'primeng/table';
import { environment } from 'src/environments/environment';

import { ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {
  

  
  environment = environment;

  items: any[] = [];
  loading: boolean = false;
  totalRecords: number = 0;

  searchText: string = '';

  @ViewChild('filter') filter!: ElementRef;

  @ViewChild('dt1') dt1!: Table;

  constructor(private wmsService: WmsService,
    private router: Router,private route: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  /* LIMPIAR FILTROS */

  clear() {

  this.searchText = '';

  if (this.filter) {
    this.filter.nativeElement.value = '';
  }

  this.dt1.first = 0;   // reset paginacion
  this.dt1.reset();     // dispara lazy load

}

  /* BUSCADOR */

  onGlobalFilter(event: Event) {

  this.searchText = (event.target as HTMLInputElement).value;

  this.dt1.first = 0;
  this.dt1.reset();

}

  /* IMPORTAR EXCEL */

  importItems(event: any) {

    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('File', file);

    this.wmsService.importItems(formData)
      .subscribe((res: any) => {

        alert(`Created: ${res.created} | Updated: ${res.updated}`);

        this.loadItemsLazy({
          first: 0,
          rows: 20
        });

      });

  }

  /* EXPORTAR EXCEL */

  exportItems() {

    this.wmsService.exportItems()
      .subscribe((blob: Blob) => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'items_export.xlsx';
        a.click();

        window.URL.revokeObjectURL(url);

      });

  }

  /* PAGINACION LAZY */

  loadItemsLazy(event: any) {

    const pageNumber = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.loading = true;

    this.wmsService
      .getItems(pageNumber, pageSize, this.searchText)
      .subscribe((response: any) => {

        this.items = response.data;
        this.totalRecords = response.totalRecords;
        this.loading = false;

      });

  }

openMovements(item: any) {

  console.log('clicked', item);

  this.router.navigate(
    ['/dashboard/inventory/movements', item.itemId]
  );

}
  viewMode = 'table';

viewOptions = [
  {  value: 'table', icon: 'pi pi-bars' },
  { value: 'grid', icon: 'pi pi-th-large' }
];

serverUrl = environment.serverUrl;


openItem(item: any) {
  console.log('clicked', item);
  this.router.navigate(['details', item.itemId], { relativeTo: this.route });
}

}