import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './core/service/auth.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    whatsAppLink = '';
    private navigationSubscription?: Subscription;

    constructor(
        private primengConfig: PrimeNGConfig,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.updateWhatsAppLink();
        this.navigationSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => this.updateWhatsAppLink());
    }

    ngOnDestroy(): void {
        this.navigationSubscription?.unsubscribe();
    }

    openWhatsApp(): void {
        window.open(this.whatsAppLink, '_blank', 'noopener,noreferrer');
    }

    private updateWhatsAppLink(): void {
        const requestId = this.findActiveRequestId(this.router.routerState.snapshot.root);
        const displayName = this.authService.isLogged() ? this.authService.getDisplayName().trim() : '';
        const message = displayName
            ? requestId
                ? `Hola, soy ${displayName}. Necesito ayuda con mi solicitud #${requestId} en ${environment.appName}.`
                : `Hola, soy ${displayName}. Necesito ayuda con mi solicitud en ${environment.appName}.`
            : `Hola, necesito ayuda con mi solicitud en ${environment.appName}.`;

        this.whatsAppLink = `https://wa.me/${environment.whatsAppPhone}?text=${encodeURIComponent(message)}`;
    }

    private findActiveRequestId(snapshot: ActivatedRouteSnapshot): string | null {
        const routeRequestId = snapshot.paramMap.get('id');
        if (routeRequestId && this.router.url.includes('/servicesrequest/')) {
            return routeRequestId;
        }

        for (const child of snapshot.children) {
            const childRequestId = this.findActiveRequestId(child);
            if (childRequestId) {
                return childRequestId;
            }
        }

        return null;
    }
}
