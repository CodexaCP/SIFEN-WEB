import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceiptsComponent } from './receipts/receipts.component';
import { CreateReceiptsComponent } from './create-receipts/create-receipts.component';
import { ReceiptsDetailsComponent } from './receipts-details/receipts-details.component';

const routes: Routes = [

  {
      path: '',
      component: ReceiptsComponent
    },
    {
      path: 'create',
      component: CreateReceiptsComponent
    },
   {
  path: 'details/:id',
  component: ReceiptsDetailsComponent
}


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReceiptsRoutingModule { }
