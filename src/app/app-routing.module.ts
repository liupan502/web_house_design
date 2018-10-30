import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HouselayoutModule } from './houselayout/houselayout.module';

import { IndexComponent } from './index/index.component';

export const routes: Routes = [
  { path: '', redirectTo: 'houselayout', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'houselayout', loadChildren: 'app/houselayout/houselayout.module#HouselayoutModule'},
];


@NgModule({
  imports: [ HouselayoutModule,  RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}