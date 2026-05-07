import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';


import { ErrorComponent } from './auth/error/error.component';
import { AccessComponent } from './auth/access/access.component';


import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { ListComponent } from './pages/services/list/list.component';





@NgModule({
    declarations: [
        AppComponent,
        NotfoundComponent,
        ErrorComponent,
        AccessComponent
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        BrowserModule
    ],
    providers: [
        CountryService,
        CustomerService,
        EventService,
        IconService,
        NodeService,
        PhotoService,
        ProductService,

        provideHttpClient(withInterceptors([jwtInterceptor]))
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
