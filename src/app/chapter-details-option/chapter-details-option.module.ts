import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChapterDetailsOptionPageRoutingModule } from './chapter-details-option-routing.module';

import { ChapterDetailsOptionPage } from './chapter-details-option.page';
//import { NCFChatService } from '../ncfchat.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChapterDetailsOptionPageRoutingModule
  ],
  declarations: [ChapterDetailsOptionPage],
  providers: []
})
export class ChapterDetailsOptionPageModule {}
