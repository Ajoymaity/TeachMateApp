import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Response } from '../response';
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
  userType: string = '';
  constructor(
    private router: Router,
    private http: HttpClient,
  ) {
    let data = this.router.getCurrentNavigation()?.extras?.queryParams;
    console.log(data, 'data');
    if (data) {
      this.contents = [];
      this.contents = data['content'];
      this.query = data['query'];
      this.chapterName = data['chapter'] || '';
      this.qUrl = data['query'].split(' ').join('%20');
      this.details = data['details']
      this.userType = data['role']
    }
  }

  ngOnInit() {
    let selectedContent;
    this.contents.forEach(a => {
      if (a.selected) {
        selectedContent = a.type
      }
    });
    this.selectedChip = selectedContent;
    var uuid_number = this.details?.gradeLevel?.toLowerCase().includes('class 8') ? '4c67c7f4-0919-11ee-9081-0242ac110002' : '8800c6da-0919-11ee-9081-0242ac110002';
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
      if (cont.type == chip.type) {
        cont.selected = (cont.type == chip.type) ? true : false;
        quetionUrl = cont.question.split(' ').join('%20')
        console.log(cont, 'cont');
      }
    });
    var uuid_number = this.details?.gradeLevel?.toLowerCase().includes('class 8') ? '4c67c7f4-0919-11ee-9081-0242ac110002' : '8800c6da-0919-11ee-9081-0242ac110002';
    let url = `${environment.questionGptUrl}?uuid_number=${uuid_number}&query_string=${quetionUrl}`;
    // let url = `${environment.questionGptUrl}=${quetionUrl}`;
    console.log(url, 'url');
    this.getData(url);
  }

  getData(url: any) {
    let msg = { text: '', from: Creator.Bot, innerHtml: false }
    this.messages.push(msg);
    this.http.get(url, { responseType: 'json' }).subscribe((res: any) => {
      console.log('res ', res);
      this.messages[this.messages.length-1].text = res && res.answer ? res['answer'] : "No Response";
      this.disableSelect = false;
      let arr: Array<string> = [];
      switch(this.selectedChip) {
        case "Quiz":
          arr = ["Practice Resource", "Practice Question Set"];
          break;
        case "Summary":
        case "Important Words":
          arr = ["Explanation Content"];
          break;
        case "Teacher Aid":
          arr = ["Teacher Resource"];
        break;
      }
      let msg = {text: '', from: Creator.Bot, innerHtml: true}
      this.messages.push(msg);
      this.getContentDetails(arr).subscribe((data) => {
        console.log('teacherrrrrrrr', data)
        let output = `<div style="width: 100%; color: black"> <p>Here are courses which can help you learn more about this chapter:<p>`;
        data.result.content.forEach(item => {
          output += `<p style="color: black">${item.name}. <a href='https://diksha.gov.in/explore-course/course/${item.identifier}'>https://diksha.gov.in/explore-course/course/${item.identifier}</a></p>`
        });
        output +=`</div>`
        console.log('output', output);
        let ele = document.getElementById('chip');
        console.log(ele, 'ele');
        if (ele) {
          ele.innerHTML = output;
        }
      })
    })
  }

  askQuestion() {
    let msg;
    window.scrollTo(0, document.body.scrollHeight);
    msg = { text: this.question, from: Creator.Me, innerHtml: false };
    this.messages.push(msg);
    this.disableSelect = true;
  //  this.question = this.question.split(' ').join('');
    console.log('this.details.gradeLevel',  this.details.gradeLevel)
    var uuid_number = this.details?.gradeLevel?.toLowerCase().includes('class 8') ? '4c67c7f4-0919-11ee-9081-0242ac110002' : '8800c6da-0919-11ee-9081-0242ac110002';
    let url = `${environment.questionGptUrl}?uuid_number=${uuid_number}&query_string=${this.question}`;
    console.log('url is', url)
    this.question = "";
    msg = { text: "", from: Creator.Bot, innerHtml: false }
    this.messages.push(msg);
    console.log('before get')
    this.http.get(url, { responseType: 'json' }).subscribe((res: any) => {
      console.log('.....................', res.answer)
      if (res) {
        this.messages[this.messages.length - 1].text = res && res.answer ? res['answer'] : "No Response";
        this.disableSelect = false;
      }
    })
  }

  getContentDetails(primaryCategories: Array<string>) {
    return this.http.post<Response>(environment.teacherBaseUrl, {
        "request": {
          "filters": {
            "primaryCategory": primaryCategories

          },
          "limit": 10,
          "query": this.chapterName,
          "sort_by": {
            "lastPublishedOn": "desc"
          },
          "fields": [
            "name",
            "identifier",
            "contentType"
          ],
          "softConstraints": {
            "badgeAssertions": 98,
            "channel": 100
          },
          "mode": "soft",
          "facets": [
            "se_boards",
            "se_gradeLevels",
            "se_subjects",
            "se_mediums",
            "primaryCategory"
          ],
          "offset": 0
        }
    });

}
}
