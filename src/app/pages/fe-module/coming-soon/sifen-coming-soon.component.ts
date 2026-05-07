import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-sifen-coming-soon',
    templateUrl: './sifen-coming-soon.component.html',
    styleUrls: ['./sifen-coming-soon.component.scss']
})
export class SifenComingSoonComponent {
    constructor(
        private readonly location: Location,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {}

    get title(): string {
        return this.route.snapshot.data['title'] || 'Instancia en desarrollo';
    }

    goBack(): void {
        this.location.back();
    }

    goToDashboard(): void {
        this.router.navigate(['/sifen/dashboard']);
    }
}
