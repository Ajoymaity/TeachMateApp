import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChapterDetailsOptionPage } from './chapter-details-option.page';

const routes: Routes = [
  {
    path: '',
    component: ChapterDetailsOptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChapterDetailsOptionPageRoutingModule {}
