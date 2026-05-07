import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { authGuard } from './core/guards/auth.guard';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: 'auth',
                    loadChildren: () => import('./auth/login/login.module').then((m) => m.LoginModule)
                },
                {
                    path: 'landing',
                    loadChildren: () => import('./demo/components/landing/landing.module').then((m) => m.LandingModule)
                },
                {
                    path: 'sifen',
                    loadChildren: () => import('./pages/fe-module/fe-module.module').then((m) => m.FeModuleModule)
                },
                {
                    path: 'fe',
                    loadChildren: () => import('./pages/fe-module/fe-module.module').then((m) => m.FeModuleModule)
                },
                { path: '', redirectTo: 'landing', pathMatch: 'full' },
                {
                    path: 'dashboard',
                    component: AppLayoutComponent,
                    canActivate: [authGuard],
                    canActivateChild: [authGuard],
                    children: [
                        {
                            path: '',
                            loadChildren: () => import('./demo/components/dashboard/dashboard.module').then((m) => m.DashboardModule)
                        },
                        {
                            path: 'customers',
                            loadChildren: () => import('./pages/customers/customers.module').then((m) => m.CustomersModule)
                        },
                        {
                            path: 'services',
                            loadChildren: () => import('./pages/services/services.module').then((m) => m.ServicesModule)
                        },
                        {
                            path: 'servicesrequest',
                            loadChildren: () => import('./pages/servicesrequest/servicesrequest.module').then((m) => m.ServicesrequestModule)
                        },
                        {
                            path: 'audit',
                            loadChildren: () => import('./pages/audit/audit.module').then((m) => m.AuditModule)
                        },
                        {
                            path: 'system-diagnostics',
                            loadChildren: () => import('./pages/system-diagnostics/system-diagnostics.module').then((m) => m.SystemDiagnosticsModule)
                        },
                        {
                            path: 'fe',
                            loadChildren: () => import('./pages/fe-module/fe-module.module').then((m) => m.FeModuleModule)
                        }
                    ]
                },
                { path: 'notfound', component: NotfoundComponent },
                { path: '**', redirectTo: 'landing' }
            ],
            {
                useHash: true,
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                onSameUrlNavigation: 'reload'
            }
        )
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
