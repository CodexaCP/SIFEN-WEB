import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-sales',
  templateUrl: './create-sales.component.html',
  styleUrls: ['./create-sales.component.scss']
})
export class CreateSalesComponent implements OnInit {

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

  
  statusActions: any[] = [];

  ngOnInit() {
    this.updateActions();
  }

  // =========================
  // ACTIONS
  // =========================

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

  menuOpen = false;

toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

  releaseOrder() {
    if (this.model.status !== 'Open') return;

    this.model.status = 'Released';
    this.updateActions();

    console.log('Order released');
  }

  reopenOrder() {
    if (this.model.status !== 'Released') return;

    this.model.status = 'Open';
    this.updateActions();

    console.log('Order reopened');
  }

  createShipment() {
    if (this.model.status !== 'Released') return;

    console.log('Creating shipment...');
  }

  // =========================
  // HELPERS
  // =========================

  get isReleased(): boolean {
    return this.model.status === 'Released';
  }

  get isOpen(): boolean {
    return this.model.status === 'Open';
  }

}