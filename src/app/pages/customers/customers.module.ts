import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { DetailsComponent } from './details/details.component';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';     
import { ToastModule } from 'primeng/toast';           // 🔥 FALTABA

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';  // 🔥 FALTABA

import { MessageService } from 'primeng/api';          // 🔥 FALTABA

@NgModule({
  declarations: [
    CustomersComponent,
    ListComponent,
    CreateComponent,
    DetailsComponent
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,

    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    DropdownModule,        // ✔ necesario para p-dropdown
    ToastModule,           // ✔ necesario para p-toast

    FormsModule,
    ReactiveFormsModule    // ✔ necesario para formGroup
  ],
  providers: [
    MessageService         // ✔ necesario para usar this.messageService
  ]
})
export class CustomersModule { }