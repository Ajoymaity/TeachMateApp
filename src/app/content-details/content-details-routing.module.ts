import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContentDetailsPage } from './content-details.page';

const routes: Routes = [
  {
    path: '',
    component: ContentDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentDetailsPageRoutingModule {}
