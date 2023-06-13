import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContentDetailsPageRoutingModule } from './content-details-routing.module';

import { ContentDetailsPage } from './content-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContentDetailsPageRoutingModule
  ],
  declarations: [ContentDetailsPage]
})
export class ContentDetailsPageModule {}
