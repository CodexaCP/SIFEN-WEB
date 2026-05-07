import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NacimientosComponent } from './nacimientos.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
		{ path: '', component: NacimientosComponent }
	])],
  exports: [RouterModule]
})
export class NacimientosRoutingModule { }
