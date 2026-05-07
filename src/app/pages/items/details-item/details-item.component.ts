import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { WmsService } from 'src/app/layout/service/wms.service';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';





@Component({
  selector: 'app-details-item',
  templateUrl: './details-item.component.html',
  styleUrls: ['./details-item.component.scss']
})
export class DetailsItemComponent implements OnInit {


    environment = environment;

  /* ===================== TRACKING ===================== */

  activeSwitch: boolean = true;
  lotSwitch: boolean = false;
  serialSwitch: boolean = false;
  expSwitch: boolean = false;

  /* ===================== DROPDOWNS ===================== */

  type: SelectItem[] = [];
  selectedDrop: string = '';

  binTypes: SelectItem[] = [];
  binType: string = '';

  /* ===================== GENERAL FIELDS ===================== */
  item: any = {
  images: []};
  Item_No: string = '';
  Description: string = '';
  Part_No: string = '';
  Alternative_Code: string = '';
  Category_Code: string = '';
  Brand: string = '';
  UOM: string = '';

  /* ===================== INVENTORY ===================== */
  
  qtyOnHand: number = 0;
  qtyOnPO: number = 0;
  qtyOnSO: number = 0;
  available: number = 0;

  unitVolume: number = 0;
  unitWeight: number = 0;

  /* ===================== WAREHOUSE ===================== */

  defaultBin: string = '';
  allowPicking: boolean = true;
  allowPutaway: boolean = true;

  /* ===================== IMAGES ===================== */

  images: string[] = [];

  /* ===================== DOCUMENT SEQUENCE ===================== */

  document: any[] = [];
  Documenttype: string = 'ITEM_CREATED';

  searchText: string = '';

  loading = true;
  totalRecords = 0;

  constructor(private wmsService: WmsService,
    private location: Location, private route: ActivatedRoute
  ) {}

  /* ===================================================== */
  /* INIT */
  /* ===================================================== */

  ngOnInit() {


    const id = this.route.snapshot.paramMap.get('id');

      console.log("ID recibido:", id);

      if (id) {
        this.wmsService.getItemById(id).subscribe(item => {
          console.log("Item:", item);
          this.item = item;
          this.wmsService
          .getItems(1, 1, this.item.itemNo)
          .subscribe((response: any) => {

            

            this.qtyOnHand = this.item.quantityOnHand ?? 0;
            this.qtyOnPO = this.item.qtyOnPurchOrder ?? 0;
            this.qtyOnSO = this.item.qtyOnSalesOrder ?? 0;
            this.available = this.item.qtyAvailable ?? 0;

            //console.log("qtyOnHand:", this.qtyOnSO);
        
        });}) }


    /* ITEM TYPES */

    this.type = [
      { label: 'Inventory', value: 'Inventory' },
      { label: 'Non-Inventory', value: 'Non-Inventory' },
      { label: 'Service', value: 'Service'}
    ];

    /* BIN TYPES */

    this.binTypes = [
      { label: 'Pick', value: 'Pick' },
      { label: 'Putaway', value: 'Putaway' },
      { label: 'Storage', value: 'Storage' }
    ];

    
  }

  
    saveItem() {
  this.wmsService.updateItem(this.item.id, this.item)
    .subscribe(() => {
      console.log("Item updated:",this.item);
    });
}

  

  /* ===================================================== */
  /* IMAGE UPLOAD */
  /* ===================================================== */

  onImageUpload(event: any) {

    for (let file of event.files) {

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.images.push(e.target.result);
      };

      reader.readAsDataURL(file);

    }

  }

  /* ===================================================== */
  /* CANCEL */
  /* ===================================================== */

  cancel() {

    this.resetForm();

  }

  /* ===================================================== */
  /* DELETE (placeholder) */
  /* ===================================================== */

  deleteItem() {

    console.log('Delete logic here');

  }

  /* ===================================================== */
  /* GENERATE ITEM NUMBER */
  /* ===================================================== */

  generateItemNumber(lastNumber: number): string {

    const next = lastNumber + 1;
    const padded = next.toString().padStart(6, '0');

    return `ITM-${padded}`;

  }

  /* ===================================================== */
  /* RESET FORM */
  /* ===================================================== */

  resetForm() {

    this.Description = '';
    this.Part_No = '';
    this.Alternative_Code = '';
    this.Category_Code = '';
    this.Brand = '';
    this.UOM = '';

    this.selectedDrop = '';

    this.activeSwitch = true;
    this.lotSwitch = false;
    this.serialSwitch = false;
    this.expSwitch = false;

    this.qtyOnHand = 0;
    this.qtyOnPO = 0;
    this.qtyOnSO = 0;
    this.available = 0;

    this.unitVolume = 0;
    this.unitWeight = 0;

    this.defaultBin = '';
    this.allowPicking = true;
    this.allowPutaway = true;

    this.binType = '';

    this.images = [];

  }

  /* ===================================================== */
  /* Back FORM */
  /* ===================================================== */
  goBack() {
  this.location.back();
}

showSidebar = false;
imagePreview: string | ArrayBuffer | null = null;


/* ===================================================== */
/* Upload file to item Card */
/* ===================================================== */

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();

  //  MATCH con backend
  formData.append('File', file);
  formData.append('ItemId', this.item.id);

  this.wmsService.uploadImage(formData).subscribe((res: any) => {

    console.log("Upload response:", res);

    // backend ya devuelve ItemImageDto
    if (!this.item.images) {
      this.item.images = [];
    }

    this.item.images.push({
      url: res.url,
      isPrimary: res.isPrimary
    });

    // preview
    this.imagePreview = this.serverUrl + res.url;

  });
}


/* ===================================================== */
/* On Image Error */
/* ===================================================== */
onImageError(event: any) {
  event.target.src = 'assets/no-image.png';
}
serverUrl = environment.serverUrl;

}