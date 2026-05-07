import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesrequestRoutingModule } from './servicesrequest-routing.module';
import { ServicesrequestComponent } from './servicesrequest.component';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { DetailsComponent } from './details/details.component';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';


@NgModule({
  declarations: [
    ServicesrequestComponent,
    ListComponent,
    CreateComponent,
    DetailsComponent
  ],
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    ServicesrequestRoutingModule,
    TagModule,
     TableModule,
  ButtonModule,
  InputTextModule,
  FormsModule,
  ToastModule,
  ConfirmDialogModule,
  DropdownModule,
  CheckboxModule
  ]
})
export class ServicesrequestModule { }
