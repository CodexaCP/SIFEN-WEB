import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { AuthService } from '@core/service/auth.service';
import { SifenPlatformService } from './services/sifen-platform.service';

@Injectable({ providedIn: 'root' })
export class SifenAdminGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly sifenPlatformService: SifenPlatformService
    ) {}

    canActivate(): Observable<boolean | UrlTree> {
        if (!this.authService.isLogged()) {
            return of(this.router.createUrlTree(['/sifen/login']));
        }

        const session = this.authService.getSession();
        if (this.sifenPlatformService.isSuperAdminRole(session?.role)) {
            return of(true);
        }

        return this.sifenPlatformService.getCurrentUser().pipe(
            map((user) => this.sifenPlatformService.isSuperAdminRole(user.role) ? true : this.router.createUrlTree(['/sifen/dashboard'])),
            catchError(() => of(this.router.createUrlTree(['/sifen/dashboard'])))
        );
    }
}
