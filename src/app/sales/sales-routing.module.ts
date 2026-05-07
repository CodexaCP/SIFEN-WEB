import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesHeaderListComponent } from './sales-header-list/sales-header-list.component';
import { CreateSalesComponent } from './create-sales/create-sales.component';
import { SalesLineListComponent } from './sales-line-list/sales-line-list.component';

const routes: Routes = [
{
    path: '',
    component: SalesHeaderListComponent
  },
  {
    path: 'createsalesortder',
    component: CreateSalesComponent
  },
  {
    path: 'salesorderlines',
    component: SalesLineListComponent
  }



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
