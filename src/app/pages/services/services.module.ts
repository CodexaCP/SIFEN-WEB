import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent } from './services.component';
import { ListComponent } from './list/list.component';
import { DetailsComponent } from './details/details.component';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateComponent } from './create/create.component';
import { ConfirmationService, MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    ServicesComponent,
    ListComponent,
    DetailsComponent,
    CreateComponent 
  ],
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    ServicesRoutingModule,

    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    InputNumberModule,
    InputSwitchModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    ReactiveFormsModule
  ]
})
export class ServicesModule { }
