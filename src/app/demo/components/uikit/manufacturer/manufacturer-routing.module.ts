import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ManufacturerComponent} from './manufacturer.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
		{ path: '', component: ManufacturerComponent }
	])],
  exports: [RouterModule]
})
export class ManufacturerRoutingModule { }
