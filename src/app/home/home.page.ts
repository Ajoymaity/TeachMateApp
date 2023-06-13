import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private router: Router,
    private barcodeScanner: BarcodeScanner
  ) {}

  URLToObject(url: any) {
    var request: any = {};
    var pairs = url.split('?')[1].split('&');
    for (var i = 0; i < pairs.length; i++) {
        if(!pairs[i])
            continue;
        
        var pair = pairs[i].split('=');
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
      this.router.navigate(['./chapter-details-option'], requestParam);
     }).catch(err => {
         console.log('Error', err);
     });
  }

}
