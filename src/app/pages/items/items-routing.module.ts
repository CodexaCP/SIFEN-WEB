import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemsComponent } from './items/items.component';
import { DetailsItemComponent } from './details-item/details-item.component';
import { InventoryComponent } from '../inventory/inventory.component';
import { CreateItemsComponent } from './create-items/create-items.component';

const routes: Routes = [
  {
    path: '',
    component: ItemsComponent
  },
  {
    path: 'details/:id',
    component: DetailsItemComponent
  },
  {
    path: 'create_item',
    component: CreateItemsComponent
  },
  { path: 'movements/:id', component: InventoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemsRoutingModule { }
