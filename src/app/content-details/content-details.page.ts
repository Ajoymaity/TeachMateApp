import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
enum Creator {
  Me = 0,
  Bot = 1,
}
@Component({
  selector: 'app-content-details',
  templateUrl: './content-details.page.html',
  styleUrls: ['./content-details.page.scss'],
})
export class ContentDetailsPage implements OnInit {
  chapterName: string = ""
  contents: Array<any> = []
  loadingCtrl: any;
  query: any;
  qUrl: string = "";
  question: string = '';
  messages: Array<any> = [];
  selectedChip: any;
  disableSelect: boolean = true;
  details: any;
  constructor(
    private router: Router,
    private http: HttpClient,
  ) { 
    let data = this.router.getCurrentNavigation()?.extras?.queryParams;
    console.log(data, 'data');
    if(data) {
      this.contents = [];
      this.contents = data['content'];
      this.query = data['query'];
      this.chapterName = data['chapter'] || '';
      this.qUrl = data['query'].split(' ').join('%20');
      this.details = data['details']
    }
  }

  ngOnInit() {
    let selectedContent;
    this.contents.forEach(a => {
      if (a.selected) {
        selectedContent = a.type
    }});
    this.selectedChip = selectedContent;
    var uuid_number = this.details.gradeLevel.toLowerCase().includes('class 8') ? '4c67c7f4-0919-11ee-9081-0242ac110002' : '8800c6da-0919-11ee-9081-0242ac110002';
    let url = `${environment.questionGptUrl}?uuid_number=${uuid_number}&query_string=${this.qUrl}`;
    // let url = `${environment.questionGptUrl}=${this.qUrl}`;
    console.log('url ', url);
    this.getData(url);
  }

  navigateToContentDetails(chip: any) {
    let quetionUrl;
    this.selectedChip = chip.type;
    this.disableSelect = true;
    this.contents.forEach(cont => {
      if(cont.type == chip.type) {
        cont.selected = (cont.type == chip.type) ? true : false;
        quetionUrl = cont.question.split(' ').join('%20')
        console.log(cont,  'cont');
      }
    });
    var uuid_number = this.details.gradeLevel.toLowerCase().includes('class 8') ? '4c67c7f4-0919-11ee-9081-0242ac110002' : '8800c6da-0919-11ee-9081-0242ac110002';
    let url = `${environment.questionGptUrl}?uuid_number=${uuid_number}&query_string=${quetionUrl}`;
   // let url = `${environment.questionGptUrl}=${quetionUrl}`;
    console.log(url,  'url');
    this.getData(url);
  }

  getData(url: any) {
    let msg = {text: '', from: Creator.Bot}
    this.messages.push(msg);
    this.http.get(url, {responseType: 'json'}).subscribe((res: any) => {
      console.log('res ', res);
      this.messages[this.messages.length-1].text = res && res.answer ? res['answer'] : "No Response";
      this.disableSelect = false
    })
  }

  askQuestion() {
    let msg;
    window.scrollTo(0,document.body.scrollHeight);
    msg = {text: this.question, from: Creator.Me};
    this.messages.push(msg);
    this.disableSelect = true;
  //  this.question = this.question.split(' ').join('');
    console.log('this.details.gradeLevel',  this.details.gradeLevel)
    var uuid_number = this.details.gradeLevel.toLowerCase().includes('class 8') ? '4c67c7f4-0919-11ee-9081-0242ac110002' : '8800c6da-0919-11ee-9081-0242ac110002';
    let url = `${environment.questionGptUrl}?uuid_number=${uuid_number}&query_string=${this.question}`;
    console.log('url is', url)
    this.question = "";
    msg = {text: "", from: Creator.Bot}
    this.messages.push(msg);
    console.log('before get')
    this.http.get(url, {responseType: 'json'}).subscribe((res: any) => {
      console.log('.....................', res.answer)
      if (res) {
        this.messages[this.messages.length-1].text = res && res.answer ? res['answer'] : "No Response";
        this.disableSelect = false;
      }
    })
  }
}
