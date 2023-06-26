import { HttpClient } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { environment } from 'src/environments/environment';
import { Response } from '../response';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  appName: string = "Ed Saathi"
  question: string = "";
  appLogo: string =  "";
  chapterTilte='1- CROP PRODUCTION AND MANAGEMENT';
  userType = '';
  supportedUserTypeConfig: Array<any> = []
  selectedUserType: any = "";
  isMenuOpen: boolean = true;
  title: string = 'Teachmate';
  constructor(
    private router: Router,
    private barcodeScanner: BarcodeScanner,
    private http: HttpClient,
    public menuCtrl: MenuController,
  ) {
    this.supportedUserTypeConfig = [ {
      name: "Teacher",
      code: 'teacher',
      image: 'teachBot.png',
      selected: true
    },
    {
      name: "Student",
      code: 'student',
      image: 'ic_student.svg',
      selected: false
    }
   ]
  //  this.selectedUserType = this.supportedUserTypeConfig[0].code;
   this.userType = this.supportedUserTypeConfig[0].name;
  }

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
  async openQRScanner() {
    if (this.userType) {
      this.barcodeScanner.scan().then(async (barcodeData) => {
        console.log('Barcode data', barcodeData);
        var text: any = barcodeData.text;
        if (barcodeData.text.includes('/')) {
            var rgx = '(\/dial\/(?<sunbird>[a-zA-Z0-9]+)|(\/QR\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))';
  
            const execArray = (new RegExp(rgx)).exec(barcodeData.text);
            text = execArray.groups[Object.keys(execArray.groups).find((key) => !!execArray.groups[key])]
        }
        console.log('texxxt', text)
        const data = this.getDialCodeInfo(text).subscribe(async (data) => {
          console.log('///////', data)

          if (data && data.result && data.result.content) {
            let contentDEtails = {
              name: data.result.content[0].name,
              gradeLevel: data.result.content[0].gradeLevel?.join(','),
              subject: data.result.content[0].subject,
              board: data.result.content[0].organisation,
              medium: data.result.content[0].medium
            }
            this.chapterTilte = contentDEtails.name
            this.selectedUser(this.userType, '', contentDEtails) 
          }
          // const requestParam: NavigationExtras = {
          //   state: {
          //     name: content.name,
          //     gradeLevel: content.gradeLevel,
          //     subject: content.subject,
          //     board: content.organisation,
          //     medium: content.medium
          //   }
          // }
          // await this.router.navigate(['./chapter-details-option'], requestParam);
        });
        console.log('...........', data)
       }).catch(err => {
           console.log('Error', err);
       });
    }
  }

  async selectedUser(userType: string, code: string, contentDetails?: any) {
    this.selectedUserType = userType;
    this.userType = userType;
    var contents: Array<any> = [];
    if (userType === 'Student') {
      contents = [
        {type:"Quiz", selected: false, question: 'As a student, give me 5 MCQ with correct answer for ' + this.chapterTilte, name: "help-circle", color: 'primary'},
        {type:"Summary", selected: false, question: 'As a student, give me an easy to understand summary of ' + this.chapterTilte, name: "document-text", color: 'success'},
        {type:"Important Words", selected: false, question: 'As a student, tell me important words with their meanings about this chapter that I should learn', name: "bookmarks", color: 'warning'}];
    } else if (userType === 'Teacher') {
      contents = [
        {type:"Quiz", selected: false, question: 'Generate 5 MCQ for ' + this.chapterTilte, name: "help-circle",  color: 'primary'},
        {type:"Summary", selected: false, question: 'Summarize ' + this.chapterTilte, name: "document", color: 'success'},
        {type:"Teacher Aid", selected: false, question: 'how to teach ' + this.chapterTilte + ' with activities', name: "book", color: 'warning'}];
    }
  
    // const requestParam: NavigationExtras = {
    //   state: {role: userType, contents, isQrCode: false, chapter: this.chapterTilte, details: contentDetails}
    // }
    // await this.router.navigate(['./chapter-details-option'], requestParam);
    let requestParam = {queryParams: {query: "Generate 5 MCQ for", chapter: this.chapterTilte, content: contents, details: contentDetails, title: this.title}}
    await this.router.navigate(['./content-details'], requestParam);
  }

  getDialCodeInfo(dialcode: string) {
    return this.http.post<Response>(environment.qrBaseUrl, {
      "request": {
        "filters": {
          "primaryCategory": [
            "Collection",
            "Resource",
            "Content Playlist",
            "Course",
            "Course Assessment",
            "Digital Textbook",
            "eTextbook",
            "Explanation Content",
            "Learning Resource",
            "Lesson Plan Unit",
            "Practice Question Set",
            "Teacher Resource",
            "Textbook Unit",
            "LessonPlan",
            "FocusSpot",
            "Learning Outcome Definition",
            "Curiosity Questions",
            "MarkingSchemeRubric",
            "ExplanationResource",
            "ExperientialResource",
            "Practice Resource",
            "TVLesson",
            "Course Unit",
            "Exam Question",
            "Question paper"
          ],
          "visibility": [
            "Default",
            "Parent"
          ]
        },
        "limit": 100,
        "query": dialcode,
        "sort_by": {
          "lastPublishedOn": "desc"
        },
        "fields": [
          "name",
          "appIcon",
          "mimeType",
          "gradeLevel",
          "identifier",
          "medium",
          "pkgVersion",
          "board",
          "subject",
          "resourceType",
          "primaryCategory",
          "contentType",
          "channel",
          "organisation",
          "trackable"
        ],
        "softConstraints": {
          "badgeAssertions": 98,
          "channel": 100
        },
        "mode": "soft",
        "offset": 0
      }
    });
  }

  async toggleMenu() {
    await this.menuCtrl.toggle();
    await this.menuCtrl.isEnabled();
  }

  emitSideMenuItemEvent(e: any, user: any) {
    console.log('event ', e, user);
    this.selectedUserType = user.code;
    if(this.selectedUserType == 'student') {
      this.title = 'Learnmate'
    } else {
      this.title = "Teachmate"
    }
    this.supportedUserTypeConfig.forEach(usr => {
      if(usr.code == this.selectedUserType) {
        usr.selected = true;
      } else {
        usr.selected = false;
      }
    })
    this.menuCtrl.close().then((data) => {
    }).catch((e) => {
    })
  }
}
