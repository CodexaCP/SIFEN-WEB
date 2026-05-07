import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReceiptsRoutingModule } from './receipts-routing.module';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';


import { ReceiptsComponent } from './receipts/receipts.component';
import { ReceiptsDetailsComponent } from './receipts-details/receipts-details.component';
import { DataViewModule } from 'primeng/dataview';
import { FileUploadModule } from 'primeng/fileupload';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { CreateReceiptsComponent } from './create-receipts/create-receipts.component';

@NgModule({
  declarations: [
    ReceiptsComponent,
    ReceiptsDetailsComponent,CreateReceiptsComponent
  ],
  imports: [
    CommonModule,
    ReceiptsRoutingModule,
    TableModule,
        ButtonModule,
        InputTextModule,
         DataViewModule,
        InputSwitchModule,
        FormsModule,
        TooltipModule,
        DropdownModule,
        SelectButtonModule,
        TabViewModule,
        FileUploadModule,
        TagModule,
        SidebarModule
  ]
})
export class ReceiptsModule { }
