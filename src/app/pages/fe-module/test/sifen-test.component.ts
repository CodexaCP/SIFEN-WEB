import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-sifen-test',
    template: '<h1>SIFEN TEST OK</h1>'
})
export class SifenTestComponent implements OnInit {
    ngOnInit(): void {
        console.log('SIFEN ROUTE HIT');
    }
}
