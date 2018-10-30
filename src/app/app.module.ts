import { HouseLayoutActionManagerService } from './houselayout/service/action.service';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { HeaderNavComponent } from './header-nav/header-nav.component';

import { AppRoutingModule } from './app-routing.module';

import { HouselayoutModule } from './houselayout/houselayout.module';
import { MessageManagerService, DesignService, TestService, AppService } from './service/service.service';
import { ComponentsModule } from './shared-component/shared-component.module';

import { HttpModule } from '@angular/http';

import { HttpService } from './service/http-service/http-service';

import { HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './service/http-service/auth-interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { IndexComponent } from './index/index.component';

//import {SidebarModule,DropdownModule} from 'primeng/primeng';

@NgModule({
    declarations: [
        AppComponent,
        HeaderNavComponent,
        IndexComponent,       
    ],
    imports: [
        BrowserAnimationsModule,
        AppRoutingModule,
       
        HouselayoutModule,
       
        ComponentsModule,
        FormsModule,
        HttpModule,
        HttpClientModule,
        CommonModule,
        BrowserModule,
    ],
    exports: [],
    providers: [
        Title,
        DesignService,
        TestService,
        MessageManagerService,
        HttpService,
        AppService,
        HouseLayoutActionManagerService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

