import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeLoginComponent } from './login/fe-login.component';
import { sifenAuthGuard } from './sifen-auth.guard';
import { SifenAdminGuard } from './sifen-admin.guard';
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
import { SifenKudeConfigComponent } from './kude-config/sifen-kude-config.component';
import { FeListComponent } from './list/fe-list.component';
import { SifenConfigComponent } from './sifen-config/sifen-config.component';
import { SifenFiscalOnboardingComponent } from './fiscal-onboarding/sifen-fiscal-onboarding.component';
import { SifenTestComponent } from './test/sifen-test.component';

const routes: Routes = [
    { path: 'login', component: FeLoginComponent },
    { path: 'test', component: SifenTestComponent },
    {
        path: '',
        component: SifenCompanyShellComponent,
        canActivate: [sifenAuthGuard],
        children: [
            { path: 'dashboard', component: SifenDashboardComponent },
            { path: 'invoices', component: FeListComponent },
            { path: 'invoices/new', component: FeIssueComponent },
            { path: 'invoices/emit', component: FeIssueComponent },
            { path: 'invoices/:id', component: FeDetailComponent },
            { path: 'customers', component: SifenComingSoonComponent, data: { title: 'Clientes' } },
            { path: 'products', component: SifenComingSoonComponent, data: { title: 'Productos / Servicios' } },
            { path: 'credit-notes', component: SifenComingSoonComponent, data: { title: 'Notas de crédito' } },
            { path: 'kude-templates', component: SifenComingSoonComponent, data: { title: 'Plantillas KuDE' } },
            { path: 'configuration', component: SifenComingSoonComponent, data: { title: 'Configuración SIFEN' } },
            { path: 'company/users', component: SifenCompanyUsersComponent },
            { path: 'company/sifen-config', component: SifenConfigComponent },
            { path: 'company/kude', component: SifenKudeConfigComponent },
            { path: 'company/diagnostic', component: SifenCompanyDiagnosticComponent },
            { path: 'api-integration', component: SifenComingSoonComponent, data: { title: 'Integración API' } },
            { path: 'reports', component: SifenComingSoonComponent, data: { title: 'Reportes' } },
            { path: 'integration', component: SifenIntegrationComponent },
            { path: 'help', component: SifenHelpComponent },
            {
                path: 'admin',
                canActivate: [SifenAdminGuard],
                children: [
                    { path: 'companies', component: SifenCompanyListComponent },
                    { path: 'companies/new', component: SifenCompanyCreateComponent },
                    { path: 'companies/:tenantId', component: SifenCompanyDetailComponent },
                    { path: 'companies/:tenantId/users', component: SifenCompanyUsersComponent },
                    { path: 'companies/:tenantId/sifen-config', component: SifenConfigComponent },
                    { path: 'companies/:tenantId/fiscal', component: SifenFiscalOnboardingComponent },
                    { path: 'companies/:tenantId/kude', component: SifenKudeConfigComponent },
                    { path: 'companies/:tenantId/diagnostic', component: SifenCompanyDiagnosticComponent }
                ]
            },
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeModuleRoutingModule {}
