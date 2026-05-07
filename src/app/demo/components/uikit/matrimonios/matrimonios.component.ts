import { Component ,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-matrimonios',
  templateUrl: './matrimonios.component.html',
  styleUrls: ['./matrimonios.component.scss']
})
export class MatrimoniosComponent implements OnInit {
  items: MenuItem[] = [];

    loading = [false, false, false, false];

    constructor( private router: Router){}
   

    ngOnInit() {
        this.items = [
            { label: 'Update', icon: 'pi pi-refresh' },
            { label: 'Delete', icon: 'pi pi-times' },
            { label: 'Angular.io', icon: 'pi pi-info', url: 'http://angular.io' },
            { separator: true },
            { label: 'Setup', icon: 'pi pi-cog' }
        ];
    }

    load(index: number) {
        this.loading[index] = true;
        setTimeout(() => this.loading[index] = false, 1000);
    }
    
    inscribir_matrimonio(){
      this.router.navigate(['']);  
    }

}


