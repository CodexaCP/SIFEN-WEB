import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesHeaderListComponent } from './sales-header-list/sales-header-list.component';
import { CreateSalesComponent } from './create-sales/create-sales.component';
import { SalesLineListComponent } from './sales-line-list/sales-line-list.component';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CalendarModule } from 'primeng/calendar';

import { InputSwitchModule } from 'primeng/inputswitch';
import { SplitButtonModule } from 'primeng/splitbutton';


@NgModule({
  declarations: [
  SalesHeaderListComponent,
  CreateSalesComponent,
  SalesLineListComponent


  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    FormsModule,
    CalendarModule,
    InputTextModule,
    InputSwitchModule,
    SplitButtonModule
  
  ]
})
export class SalesModule { }
