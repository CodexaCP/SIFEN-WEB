import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/service/auth.service';

export const sifenAuthGuard: CanActivateFn = (route, state) => {
    console.log('SIFEN GUARD ENTER', state.url);

    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.isLogged()) {
        return true;
    }

    authService.logout();
    return router.createUrlTree(['/sifen/login'], {
        queryParams: {
            returnUrl: state.url
        }
    });
};
