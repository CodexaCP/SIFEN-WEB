import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from "primeng/dropdown";
import { TooltipModule } from 'primeng/tooltip';
import { InventoryComponent } from './inventory.component';
import { DataViewModule } from 'primeng/dataview';


@NgModule({
  declarations: [
    InventoryComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    
        
        TableModule,
        ButtonModule,
        InputTextModule,
        InputSwitchModule,
        DataViewModule,
        FormsModule,
        TooltipModule,
        DropdownModule
  ]
})
export class InventoryModule { }
