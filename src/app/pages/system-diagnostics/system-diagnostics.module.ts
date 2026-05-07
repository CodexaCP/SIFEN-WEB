import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SystemDiagnosticsRoutingModule } from './system-diagnostics-routing.module';
import { SystemDiagnosticsComponent } from './system-diagnostics.component';

@NgModule({
    declarations: [SystemDiagnosticsComponent],
    imports: [
        CommonModule,
        SystemDiagnosticsRoutingModule,
        TableModule,
        ButtonModule,
        ToastModule
    ],
    providers: [MessageService]
})
export class SystemDiagnosticsModule {}
