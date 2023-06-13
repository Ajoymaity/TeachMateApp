import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-content-details',
  templateUrl: './content-details.page.html',
  styleUrls: ['./content-details.page.scss'],
})
export class ContentDetailsPage implements OnInit {
  chapterName: string = ""
  contents: Array<any> = []
  cardData: any;
  loadingCtrl: any;
  query: any;
  qUrl: string = "";
  question: string = '';
  constructor(
    private router: Router,
    private http: HttpClient,
    private loader: LoadingController,
  ) { 
    let data = this.router.getCurrentNavigation()?.extras?.queryParams;
    console.log(data, 'data');
    if(data) {
      this.contents = data['content'];
      this.query = data['query'];
      this.chapterName = this.query.chapter;
      this.qUrl = `Give%20me%20${this.query.class}%20${this.query.subject}%20${this.query.chapter}`;
    }
  }

  async ngOnInit() {
    let selectedContent;
    this.contents.forEach(a => {
      if (a.selected) {
        selectedContent = a.type
    }});
    let url = `${environment.baseUrl}=${this.qUrl}&${selectedContent}`;
    await this.getData(url);
  }

  async navigateToContentDetails(chip: any) {
      this.contents.forEach(cont => {
        if(chip.selected) {
          cont.selected = (cont.type == chip.type) ? true : false;
        }
      });
      let url = `${environment.baseUrl}=${this.qUrl}&${chip.type}`;
      console.log(url,  'url');
      await this.getData(url);
  }

  async getData(url: any) {
    this.loadingCtrl = await this.loader.create({
      cssClass: 'custom-loader-message-class',
      spinner: 'circular',
      message: 'Please wait while loading ...',
      translucent: true,
      backdropDismiss: false,
    });
    await this.loadingCtrl.present();
      this.http.get(url, {responseType: 'text'}).subscribe(async (res) => {
          if (res) {
            if (this.loadingCtrl) {
              await this.loadingCtrl.dismiss();
            }
            this.cardData = res;
          } else {
            if (this.loadingCtrl) {
              await this.loadingCtrl.dismiss();
            }
          }
      })
  }

  askQuestion() {
    this.question = this.question.split(' ').join('%20');
    var uuid_number = '8800c6da-0919-11ee-9081-0242ac110002';
    let url = `${environment.questionGptUrl}?uuid_number=${uuid_number}&query_string=${this.question}`;
    console.log('url is', url)
    this.http.get(url, {responseType: 'text'}).subscribe( (res) => {
      console.log('.....................', res)
    })
  }
}
