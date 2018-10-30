import { CommonModule } from '@angular/common';

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { DesignService } from './service/hsservice';
import { MessageManagerService } from '../service/message-manager.service';

import { DrawHouseLayoutService, TestMessageService } from './service/hsservice';

import { RenderData2DComponent } from './render-data-2d/render.2d.component';
import { LeftSideBarComponent } from './render-data-2d/left-side-bar/left-side-bar.component';
import { RightSideBarComponent } from './render-data-2d/right-side-bar/right-side-bar.component';
import { HouseTypeComponent } from './render-data-2d/left-side-bar/house-type/house-type.component';
import { DoorWindowComponent } from './render-data-2d/left-side-bar/door-window/door-window.component';
import { StructureComComponent } from './render-data-2d/left-side-bar/structure-com/structure-com.component';
import { MarkerComponent } from './render-data-2d/left-side-bar/marker/marker.component';
import { MainComponent } from './render-data-2d/main/main.component';
import { LandMarkComponent } from './render-data-2d/right-side-bar/land-mark/land-mark.component';
import { HouselayoutRoutingModule } from './houselayout-routing.module';
import { AdDirective } from './render-data-2d/right-side-bar/ad.directive';
import { AimshowtipDirective } from './render-data-2d/render.2d.directive'

import { StraightLineComponent } from './render-data-2d/right-side-bar/straight-line/straight-line.component';
import { ArcComponent } from './render-data-2d/right-side-bar/arc/arc.component';
import { DoorComponent } from './render-data-2d/right-side-bar/door/door.component';
import { WindowComponent } from './render-data-2d/right-side-bar/window/window.component';
import { BayWindowComponent } from './render-data-2d/right-side-bar/bayWindow/bayWindow.component';
import { DoorHoleComponent } from './render-data-2d/right-side-bar/door-hole/door-hole.component';
import { PillarComponent } from './render-data-2d/right-side-bar/pillar/pillar.component';
import { PurlinComponent } from './render-data-2d/right-side-bar/purlin/purlin.component';
import { RoundLandMarkComponent } from './render-data-2d/right-side-bar/round-land-mark/round-land-mark.component';
import { RoundWallMarkComponent } from './render-data-2d/right-side-bar/round-wall-mark/round-wall-mark.component';

import { WallMarkComponent } from './render-data-2d/right-side-bar/wall-mark/wall-mark.component';
import { ForbiddenValidatorDirective, AllowValidatorDirective } from './render-data-2d/right-side-bar/wall-mark/wall-mark.directive';
import { ComponentsModule } from './../shared-component/shared-component.module';

import { ScrollBarComponent } from './render-data-2d/main/scroll-bar/scroll-bar.component';
import { NoneComponent } from './render-data-2d/right-side-bar/none/none.component';
import { StepButtonComponent } from './render-data-2d/main/step-button/step-button.component';
import { OperateButtonGroupComponent } from './render-data-2d/main/operate-button-group/operate-button-group.component';
import { ButtonGroupComponent } from './render-data-2d/main/button-group/button-group.component';

import { MyHouselayoutComponent } from './render-data-2d/houselayout-library/my-houselayout/my-houselayout.component';
import { SearchHouselayoutComponent } from './render-data-2d/houselayout-library/search-houselayout/search-houselayout.component';
import { DetailEditComponent } from './render-data-2d/houselayout-library/detail-edit/detail-edit.component';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    BrowserAnimationsModule,
    HouselayoutRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule
  ],

  declarations: [
    RenderData2DComponent,
    LeftSideBarComponent,
    RightSideBarComponent,
    HouseTypeComponent,
    DoorWindowComponent,
    StructureComComponent,
    MarkerComponent,
    MainComponent,
    LandMarkComponent,
    AdDirective,
    AimshowtipDirective,
    StraightLineComponent,
    ArcComponent,
    DoorComponent,
    WindowComponent,
    BayWindowComponent,
    DoorHoleComponent,
    PillarComponent,
    PurlinComponent,
    RoundLandMarkComponent,
    RoundWallMarkComponent,
    WallMarkComponent,
    LandMarkComponent,
    ScrollBarComponent,
    NoneComponent,
    AllowValidatorDirective,
    ForbiddenValidatorDirective,
    StepButtonComponent,
    OperateButtonGroupComponent,
    ButtonGroupComponent,
    MyHouselayoutComponent,
    SearchHouselayoutComponent,
    DetailEditComponent
  ],
  exports: [
    SearchHouselayoutComponent
  ],
  providers: [
    DrawHouseLayoutService,
    TestMessageService,
    // MessageManagerService
  ],

  entryComponents: [
    StraightLineComponent,
    ArcComponent,
    DoorComponent,
    WindowComponent,
    BayWindowComponent,
    DoorHoleComponent,
    PillarComponent,
    PurlinComponent,
    RoundLandMarkComponent,
    RoundWallMarkComponent,
    WallMarkComponent,
    LandMarkComponent,
    ScrollBarComponent,
    NoneComponent
  ]
})
export class HouselayoutModule {
}

