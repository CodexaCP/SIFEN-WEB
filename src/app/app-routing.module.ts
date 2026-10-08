import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: 'sifen',
                    loadChildren: () => import('./pages/fe-module/fe-module.module').then((m) => m.FeModuleModule)
                },
                {
                    path: 'fe',
                    loadChildren: () => import('./pages/fe-module/fe-module.module').then((m) => m.FeModuleModule)
                },
                { path: '', redirectTo: 'sifen', pathMatch: 'full' },
                { path: 'notfound', component: NotfoundComponent },
                { path: '**', redirectTo: 'sifen' }
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
