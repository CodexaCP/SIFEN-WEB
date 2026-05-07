import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatrimoniosComponent } from './matrimonios.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
		{ path: '', component: MatrimoniosComponent }
	])],
  exports: [RouterModule]
})
export class MatrimoniosRoutingModule { }
