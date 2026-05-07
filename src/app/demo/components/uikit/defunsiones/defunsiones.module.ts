import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DefunsionesRoutingModule } from './defunsiones-routing.module';
import { DefunsionesComponent } from './defunsiones.component';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [DefunsionesComponent],
  imports: [
    CommonModule,
    DefunsionesRoutingModule,
    ButtonModule
  ]
})
export class DefunsionesModule { }
