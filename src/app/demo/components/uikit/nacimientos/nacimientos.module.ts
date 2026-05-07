import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NacimientosRoutingModule } from './nacimientos-routing.module';
import { NacimientosComponent } from './nacimientos.component';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [NacimientosComponent],
  imports: [
    CommonModule,
    NacimientosRoutingModule,
    ButtonModule
  ]
})
export class NacimientosModule { }
