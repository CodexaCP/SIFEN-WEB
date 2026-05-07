import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentsRoutingModule } from './shipments-routing.module';
import { ShipmentsComponent } from './shipments/shipments.component';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { CreateShipmentComponent } from './create-shipment/create-shipment.component';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    ShipmentsComponent,
    CreateShipmentComponent
  ],
  imports: [
    CommonModule,
    ShipmentsRoutingModule,
    TableModule,
    CommonModule,       
        FormsModule,
        TableModule,
        RatingModule,
        ButtonModule,
        SliderModule,
        InputTextModule,
        ToggleButtonModule,
        RippleModule,
        MultiSelectModule,
        DropdownModule,
        ProgressBarModule,
        ToastModule,
        TooltipModule

  
  ]
})
export class ShipmentsModule { }
