import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefunsionesComponent } from './defunsiones.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
		{ path: '', component: DefunsionesComponent }
	])],
  exports: [RouterModule]
})
export class DefunsionesRoutingModule { }
