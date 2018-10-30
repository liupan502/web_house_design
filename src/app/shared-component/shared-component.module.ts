import { from } from 'rxjs/observable/from';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { SharedModule } from './common/shared.module';
import { ConfirmationService, MessageService } from './common/api';

import { AccordionComponent } from './component/accordion/accordion.component';
import { AccordionTabComponent } from './component/accordion-tab/accordion-tab.component';
import { SideBarComponent } from './component/side-bar/side-bar.component';
import { MegaMenuComponent } from './component/mega-menu/mega-menu.component';
import { SliderComponent } from './component/slider/slider.component';
import { PaginatorComponent } from './component/paginator/paginator.component';
import { DropdownComponent } from './component/dropdown/dropdown.component';
import { GalleriaComponent } from './component/galleria/galleria.component';
import { ConfirmdialogComponent } from './component/confirmdialog/confirmdialog.component';
import { ButtonComponent } from './component/button/button.component';
import { ButtonDirective } from './component/button/button.directive';
import { FileuploadComponent } from './component/fileupload/fileupload.component';
import { MessageComponent } from './component/message/message.component';
import { MessagesComponent } from './component/messages/messages.component';




@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        BrowserAnimationsModule,
        FormsModule,
        SharedModule
    ],
    declarations: [
        AccordionComponent,
        AccordionTabComponent,
        SideBarComponent,
        MegaMenuComponent,
        SliderComponent,
        PaginatorComponent,
        DropdownComponent,
        GalleriaComponent,
        ConfirmdialogComponent,
        ButtonComponent,
        ButtonDirective,
        FileuploadComponent,
        MessageComponent,
        MessagesComponent
    ],
    exports: [
        AccordionComponent,
        AccordionTabComponent,
        SideBarComponent,
        MegaMenuComponent,
        SliderComponent,
        PaginatorComponent,
        DropdownComponent,
        GalleriaComponent,
        ConfirmdialogComponent,
        ButtonComponent,
        ButtonDirective,
        FileuploadComponent,
        MessageComponent,
        MessagesComponent
    ],
    providers: [
        ConfirmationService,
        MessageService
    ]
})
export class ComponentsModule {
}
