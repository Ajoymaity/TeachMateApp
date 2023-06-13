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
  
  openQRScanner() {
    this.barcodeScanner.scan().then(async (barcodeData) => {
      console.log('Barcode data', barcodeData);
      const requestParam: NavigationExtras = {
        state: {url: barcodeData.text.split('?')[1]}
      }
      this.router.navigate(['./chapter-details-option'], requestParam);
 
     }).catch(err => {
         console.log('Error', err);
     });
  }

}
