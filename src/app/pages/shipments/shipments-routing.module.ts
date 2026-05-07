import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShipmentsComponent } from './shipments/shipments.component';
import { CreateShipmentComponent } from './create-shipment/create-shipment.component';

const routes: Routes = [
  {
    path: '',
    component: ShipmentsComponent
  },
  {
    path: 'create',
    component: CreateShipmentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShipmentsRoutingModule { }