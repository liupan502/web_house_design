import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RenderData2DComponent } from './render-data-2d/render.2d.component';

import { HouseTypeComponent } from './render-data-2d/left-side-bar/house-type/house-type.component';
import { DoorWindowComponent } from './render-data-2d/left-side-bar/door-window/door-window.component';
import { StructureComComponent } from './render-data-2d/left-side-bar/structure-com/structure-com.component';
import { MarkerComponent } from './render-data-2d/left-side-bar/marker/marker.component';

@NgModule({
  imports: [RouterModule.forChild([
    {
      path: 'houselayout',
      component: RenderData2DComponent,
      children: [
         { path: 'house-type', component: HouseTypeComponent},
         { path: 'door-window', component:  DoorWindowComponent},
         { path: 'structure-com', component: StructureComComponent},
         { path: 'marker', component: MarkerComponent},
         { path: '', redirectTo: 'house-type', pathMatch: 'full'},
      ]
    }
  ])],
  exports: [RouterModule]
})
export class HouselayoutRoutingModule {

}
