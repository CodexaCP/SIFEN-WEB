import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FeModuleRoutingModule } from './fe-module-routing.module';
import { SifenCompanyCreateComponent } from './company-create/sifen-company-create.component';
import { SifenCompanyDetailComponent } from './company-detail/sifen-company-detail.component';
import { SifenCompanyDiagnosticComponent } from './company-diagnostic/sifen-company-diagnostic.component';
import { SifenCompanyListComponent } from './company-list/sifen-company-list.component';
import { SifenCompanyShellComponent } from './company-shell/sifen-company-shell.component';
import { SifenCompanyUsersComponent } from './company-users/sifen-company-users.component';
import { SifenComingSoonComponent } from './coming-soon/sifen-coming-soon.component';
import { SifenDashboardComponent } from './dashboard/sifen-dashboard.component';
import { FeDetailComponent } from './detail/fe-detail.component';
import { SifenHelpComponent } from './help/sifen-help.component';
import { SifenIntegrationComponent } from './integration/sifen-integration.component';
import { FeIssueComponent } from './issue/fe-issue.component';
import { SifenKudePreviewComponent } from './kude-preview/sifen-kude-preview.component';
import { SifenKudeConfigComponent } from './kude-config/sifen-kude-config.component';
import { FeListComponent } from './list/fe-list.component';
import { FeLoginComponent } from './login/fe-login.component';
import { SifenConfigComponent } from './sifen-config/sifen-config.component';
import { SifenFiscalOnboardingComponent } from './fiscal-onboarding/sifen-fiscal-onboarding.component';
import { SifenTestComponent } from './test/sifen-test.component';

@NgModule({
    declarations: [
        FeListComponent,
        FeIssueComponent,
        SifenKudePreviewComponent,
        FeDetailComponent,
        FeLoginComponent,
        SifenCompanyShellComponent,
        SifenCompanyListComponent,
        SifenCompanyCreateComponent,
        SifenCompanyDetailComponent,
        SifenCompanyUsersComponent,
        SifenComingSoonComponent,
        SifenConfigComponent,
        SifenFiscalOnboardingComponent,
        SifenCompanyDiagnosticComponent,
        SifenDashboardComponent,
        SifenIntegrationComponent,
        SifenHelpComponent,
        SifenKudeConfigComponent,
        SifenTestComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FeModuleRoutingModule,
        TableModule,
        ButtonModule,
        CardModule,
        InputTextModule,
        InputNumberModule,
        PaginatorModule,
        TagModule
    ]
})
export class FeModuleModule {
    constructor() {
        console.log('FE MODULE LOADED');
    }
}
