import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { Config } from '@ionic/angular';
import { json } from 'express';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  question: string = "";
  chapterTilte='light'

  constructor(
    private router: Router,
    private barcodeScanner: BarcodeScanner,
    private http: HttpClient,
  ) {}

  URLToObject(url: any) {
    let request: any = {};
    let pairs = url.split('?')[1].split('&');
    for (const ele of pairs) {
        if(!ele)
            continue;
        let pair = ele.split('=');
        request[pair[0]] = pair[1];
     }
     return request;
}
  openQRScanner() {
    this.barcodeScanner.scan().then(async (barcodeData) => {
      console.log('Barcode data', barcodeData);
      const requestParam: NavigationExtras = {
        state: this.URLToObject(barcodeData.text)
      }
      await this.router.navigate(['./chapter-details-option'], requestParam);
     }).catch(err => {
         console.log('Error', err);
     });
  }

  async selectedUser(userType: string) {
    var contents: Array<any> = [];
    if (userType === 'student') {
      contents = [
        {type:"Quiz", selected: false, question: 'As a student, give me 5 MCQ with correct answer for this chapter'},
        {type:"Summary", selected: false, question: 'As a student, give me an easy to understand summary of this chapter'},
        {type:"Important Words", selected: false, question: 'As a student, tell me important words with their meanings about this chapter that I should learn'}];
    } else if (userType === 'teacher') {
      contents = [
        {type:"Quiz", selected: false, question: 'Generate 5 MCQ for this ' + this.chapterTilte},
        {type:"Summary", selected: false, question: 'Summarize ' + this.chapterTilte},
        {type:"Important Words", selected: false, question: 'how to teach ' + this.chapterTilte + ' with activities'}];
    }
  
    const requestParam: NavigationExtras = {
      state: {role: userType, contents, isQrCode: false}
    }
    await this.router.navigate(['./chapter-details-option'], requestParam);
  }

}
