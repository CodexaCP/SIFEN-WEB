import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemsRoutingModule } from './items-routing.module';
import { ItemsComponent } from './items/items.component';
import { DetailsItemComponent } from './details-item/details-item.component';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from "primeng/dropdown";
import { TooltipModule } from 'primeng/tooltip';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { FileUploadModule } from 'primeng/fileupload';
import { CreateItemsComponent } from './create-items/create-items.component';
import { SidebarModule } from 'primeng/sidebar';


@NgModule({
  declarations: [
    ItemsComponent,
    DetailsItemComponent,
    CreateItemsComponent
  ],
  imports: [
    CommonModule,
    ItemsRoutingModule,
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
export class ItemsModule { }