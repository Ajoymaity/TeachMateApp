import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'chapter-details-option',
    loadChildren: () => import('./chapter-details-option/chapter-details-option.module').then( m => m.ChapterDetailsOptionPageModule)
  },
  {
    path: 'content-details',
    loadChildren: () => import('./content-details/content-details.module').then( m => m.ContentDetailsPageModule)
  },
  {
    path: 'question-set',
    loadChildren: () => import('./question-set/question-set.module').then( m => m.QuestionSetPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
