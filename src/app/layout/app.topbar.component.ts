import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, SessionUser } from '@core/service/auth.service';
import { MenuService } from './app.menu.service';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {
    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarMenuButton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        public layoutService: LayoutService,
        public menuService: MenuService,
        private authService: AuthService,
        private router: Router
    ) {}

    get session(): SessionUser | null {
        return this.authService.getSession();
    }

    get displayName(): string {
        return this.session?.displayName || this.authService.getDisplayName();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/sifen/login']);
    }
}
