import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WmsService } from 'src/app/layout/service/wms.service';
import { Table } from 'primeng/table';
import { DataView } from 'primeng/dataview';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit{
  movements: any[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  itemId?: string;

  searchText: string = '';

  @ViewChild('filter') filter!: ElementRef;

  constructor(private wmsService: WmsService, private route: ActivatedRoute) {}

  ngOnInit(): void {


    const id = this.route.snapshot.paramMap.get('id');

  console.log('ItemId', id); 

  
  this.route.params.subscribe(params => {

    this.itemId = params['id'];

    this.loadItemsLazy({
      first: 0,
      rows: 20
    });

  });

}

  /* LIMPIAR FILTROS */

  clear(table: Table) {

    table.clear();
    this.filter.nativeElement.value = '';
    this.searchText = '';

    this.loadItemsLazy({
      first: 0,
      rows: 20
    });

  }

  /* BUSCADOR */

  onGlobalFilter(event: Event) {

    this.searchText = (event.target as HTMLInputElement).value;

    this.loadItemsLazy({
      first: 0,
      rows: 20
    });

  }

  /* IMPORTAR EXCEL */

  importMovemnets(event: any) {

    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('File', file);

    this.wmsService.importMovemnets(formData)
      .subscribe((res: any) => {

        alert(`Created: ${res.created} | Updated: ${res.updated}`);

        this.loadItemsLazy({
          first: 0,
          rows: 20
        });

      });

  }

  /* EXPORTAR EXCEL */

  exportMovemnets() {

    this.wmsService.exportMovemnets()
      .subscribe((blob: Blob) => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'movements_export.xlsx';
        a.click();

        window.URL.revokeObjectURL(url);

      });

  }

  /* PAGINACION LAZY */

  loadItemsLazy(event: any) {

  const pageNumber = event.first / event.rows + 1;
  const pageSize = event.rows;

  this.loading = true;

  if (this.itemId) {

    // endpoint filtrado
    this.wmsService
      .getMovements(this.itemId)
      .subscribe((res: any) => {

        this.movements = res;
        this.totalRecords = res.length;
        this.loading = false;

      });

  } else {

    // endpoint general
    this.wmsService
      .getInventoryMovements(pageNumber, pageSize, this.searchText)
      .subscribe((response: any) => {

        this.movements = response.data;
        this.totalRecords = response.totalRecords;
        this.loading = false;

      });

  }

}
  onFilter(dv: DataView, event: Event) {
        dv.filter((event.target as HTMLInputElement).value);
    }

  
}
