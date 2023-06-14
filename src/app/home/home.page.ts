import { HttpClient } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { environment } from 'src/environments/environment';

export interface Response {
  id:           string;
  ver:          string;
  ts:           Date;
  params:       Params;
  responseCode: string;
  result:       Result;
}

export interface Params {
  resmsgid: string;
  msgid:    string;
  status:   string;
  err:      null;
  errmsg:   null;
}

export interface Result {
  count:   number;
  content: Content[];
  facets:  Facet[];
}

export interface Content {
  trackable:       Trackable;
  identifier:      string;
  subject:         string[];
  channel:         string;
  organisation:    string[];
  mimeType:        string;
  medium:          string[];
  pkgVersion:      number;
  objectType:      string;
  gradeLevel:      string[];
  appIcon:         string;
  primaryCategory: string;
  name:            string;
  contentType:     string;
  board:           string;
  resourceType:    string;
  orgDetails:      OrgDetails;
}

export interface OrgDetails {
  email:   null;
  orgName: string;
}

export interface Trackable {
  enabled:   string;
  autoBatch: string;
}

export interface Facet {
  values: Value[];
  name:   string;
}

export interface Value {
  name:  string;
  count: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  question: string = "";
  chapterTilte='12-SOME NATURAL PHENOMENA';
  userType = '';
  supportedUserTypeConfig: Array<any> = []
  selectedUserType: any;

  constructor(
    private router: Router,
    private barcodeScanner: BarcodeScanner,
    private http: HttpClient
  ) {
    this.supportedUserTypeConfig = [ {
      name: "Teacher",
      code: 'teacher',
      image: 'ic_teacher.svg'
    },
    {
      name: "Student",
      code: 'student',
      image: 'ic_student.svg'
    }]
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
        const data = (await this.getDialCodeInfo(barcodeData.text)).subscribe(async (data) => {
          console.log('///////', data)

          if (data && data.result && data.result.content) {
            let contentDEtails = {
              name: data.result.content[0].name,
              gradeLevel: data.result.content[0].gradeLevel.join(','),
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
    this.selectedUserType = code;
    this.userType = userType;
    var contents: Array<any> = [];
    if (userType === 'Student') {
      contents = [
        {type:"Quiz", selected: false, question: 'As a student, give me 5 MCQ with correct answer for ' + this.chapterTilte},
        {type:"Summary", selected: false, question: 'As a student, give me an easy to understand summary of ' + this.chapterTilte},
        {type:"Important Words", selected: false, question: 'As a student, tell me important words with their meanings about this chapter that I should learn'}];
    } else if (userType === 'Teacher') {
      contents = [
        {type:"Quiz", selected: false, question: 'Generate 5 MCQ for ' + this.chapterTilte},
        {type:"Summary", selected: false, question: 'Summarize ' + this.chapterTilte},
        {type:"Important Words", selected: false, question: 'how to teach ' + this.chapterTilte + ' with activities'}];
    }
  
    const requestParam: NavigationExtras = {
      state: {role: userType, contents, isQrCode: false, chapter: this.chapterTilte, details: contentDetails}
    }
    await this.router.navigate(['./chapter-details-option'], requestParam);
  }

  async getDialCodeInfo(dialcode: string) {
    return await this.http.post<Response>(environment.qrBaseUrl, {
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

}
