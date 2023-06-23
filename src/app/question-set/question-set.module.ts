import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuestionSetPageRoutingModule } from './question-set-routing.module';

import { QuestionSetPage } from './question-set.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuestionSetPageRoutingModule
  ],
  declarations: [QuestionSetPage]
})
export class QuestionSetPageModule {}
