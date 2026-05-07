import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { WmsService } from 'src/app/layout/service/wms.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-receipts',
  templateUrl: './create-receipts.component.html',
  styleUrls: ['./create-receipts.component.scss']
})
export class CreateReceiptsComponent implements OnInit {

  statusActions: any[] = [];
  
  model: any = {
    sellToCustomerName: '',
    sellToCustomerNo: '',
    documentDate: null,
    postingDate: null,
    dueDate: null,
    requestedDeliveryDate: null,
    externalDocumentNo: '',
    status: 'Open',
    sendEmail: false,
    isBackorder: false,
    shipmentPriority: false,
    vipCustomer: false,
    fulfillment: 0
  };

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
    item: any;
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
  projectedKits: number = 0;

  unitVolume: number = 0;
  unitWeight: number = 0;

  /* ===================== WAREHOUSE ===================== */

  defaultBin: string = '';
  allowPicking: boolean = true;
  allowPutaway: boolean = true;
  

  /* ===================== DOCUMENT SEQUENCE ===================== */

  document: any[] = [];
  Documenttype: string = 'ITEM_CREATED';

  searchText: string = '';

  loading = true;
  totalRecords = 0;
  
  

  constructor(private wmsService: WmsService, private location: Location, private route: ActivatedRoute,private router: Router) {}

  /* ===================================================== */
  /* INIT */
  /* ===================================================== */

  ngOnInit() {

  this.updateActions();
    /* ITEM TYPES */

    this.type = [
      { label: 'Inventory', value: 'Inventory' },
      { label: 'Non-Inventory', value: 'Non-Inventory' },
      { label: 'Service', value: 'Service'}
    ];

    /* DOCUMENT SEQUENCE */

    this.loadItemSequence();
  }

  /* ===================================================== */
  /* LOAD DOCUMENT SEQUENCE */
  /* ===================================================== */

  loadItemSequence() {

    this.wmsService.getDocument().subscribe({
      next: (response: any) => {

        this.document = response.data;

        const itemCreated = this.document.find(
          d => d.document_type === 'RECEIPT_CREATED'
        );

        if (itemCreated) {
          this.Item_No = this.generateItemNumber(itemCreated.lastNumber);
        }

        this.totalRecords = response.totalRecords;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

  }

  
  /* ===================================================== */
  /* Create Item */
  /* ===================================================== */
    createItem() {
   console.log('createItem() ejecutado');
  const payload = {

  Item_No: this.Item_No,
  Description: this.Description,

  Part_No: this.Part_No,
  Alternative_Code: this.Alternative_Code,
  BaseUOM: this.UOM,
  UOM:this.UOM,

  Category_Code: this.Category_Code,
  Brand: this.Brand,

  ItemType: this.selectedDrop,

  IsActive: this.activeSwitch,
  IsLotTracked: this.lotSwitch,
  IsSerialTracked: this.serialSwitch,
  IsExpirationTracked: this.expSwitch,

  QtyOnHand: this.qtyOnHand,
  QtyOnPO: this.qtyOnPO,
  QtyOnSO: this.qtyOnSO,
  ProjectedKits: this.projectedKits,

  UnitVolume: this.unitVolume,
  UnitWeight: this.unitWeight,

  DefaultBin: this.defaultBin,
  AllowPicking: this.allowPicking,
  AllowPutaway: this.allowPutaway,
  BinType: this.binType
};

  this.wmsService.createItem(payload).subscribe({

    next: (res: any) => {
      console.log('Item created:', res);

      //  REDIRECCION CLAVE
      const itemId = res.id;

      this.router.navigate(['/items/details', itemId]);
    },

    error: (err) => {
      console.error(err);
    }

  });
}  

  

  /* ===================================================== */
  /* CANCEL */
  /* ===================================================== */

  cancel() {  this.resetForm();}

  /* ===================================================== */
  /* DELETE (placeholder) */
  /* ===================================================== */

  deleteItem() { console.log('Delete logic here'); }

  /* ===================================================== */
  /* GENERATE ITEM NUMBER */
  /* ===================================================== */

  generateItemNumber(lastNumber: number): string {
    const next = lastNumber + 1;
    const padded = next.toString().padStart(6, '0');
    return `RCP-${padded}`;
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
    this.projectedKits = 0;

    this.unitVolume = 0;
    this.unitWeight = 0;

    this.defaultBin = '';
    this.allowPicking = true;
    this.allowPutaway = true;

    this.binType = '';
}

  /* ===================================================== */
  /* Back FORM */
  /* ===================================================== */
  goBack() {
  this.location.back();
}


menuOpen = false;
toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

reopenOrder() {
    if (this.model.status !== 'Released') return;

    this.model.status = 'Open';
    this.updateActions();

    console.log('Order reopened');
  }

  updateActions() {
    this.statusActions = [
      {
        label: 'Release',
        icon: 'pi pi-check',
        command: () => this.releaseOrder(),
        disabled: this.model.status !== 'Open'
      },
      {
        label: 'Reopen',
        icon: 'pi pi-refresh',
        command: () => this.reopenOrder(),
        disabled: this.model.status !== 'Released'
      }
    ];
  }

  releaseOrder() {
    if (this.model.status !== 'Open') return;

    this.model.status = 'Released';
    this.updateActions();

    console.log('Order released');
  }

}