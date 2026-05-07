import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatrimoniosRoutingModule } from './matrimonios-routing.module';
import { MatrimoniosComponent } from './matrimonios.component';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [
    MatrimoniosComponent
  ],
  imports: [
    CommonModule,
    MatrimoniosRoutingModule,
    ButtonModule
  ]
})
export class MatrimoniosModule { }
