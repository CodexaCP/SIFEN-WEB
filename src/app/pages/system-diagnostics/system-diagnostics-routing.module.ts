import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemDiagnosticsComponent } from './system-diagnostics.component';

const routes: Routes = [
    { path: '', component: SystemDiagnosticsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SystemDiagnosticsRoutingModule {}
