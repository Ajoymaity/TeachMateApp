import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Response } from '../response';
import { IonContent, IonPopover, LoadingController } from '@ionic/angular';
import { Media, MediaObject } from '@awesome-cordova-plugins/media/ngx';
import { File, IWriteOptions } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { Printer } from "@awesome-cordova-plugins/printer/ngx";
import { Observable } from 'rxjs';
enum Creator {
  Me = 0,
  Bot = 1,
}
declare var cordova: any;
declare let window: any;
@Component({
  selector: 'app-content-details',
  templateUrl: './content-details.page.html',
  styleUrls: ['./content-details.page.scss'],
})
export class ContentDetailsPage implements OnInit {
  chapterName: string = ""
  contents: Array<any> = []
  query: any;
  qUrl: string = "";
  question: string = '';
  messages: Array<any> = [];
  selectedChip: any;
  disableSelect: boolean = true;
  details: any;
  userType: string = '';
  @ViewChild(IonContent, {static: true}) private content: any;
  quickActions: any = [];
  extraOptions: any = []
  @ViewChild(IonPopover) popover: IonPopover;
  @ViewChild(IonPopover) popoverhint: IonPopover;
  recording: boolean = false;
  startTimer: any
  pause: boolean = false
  fileName:any;
  filesPath: any;
  audio: MediaObject;
  base64: any;
  dataAudios: any;
  sanitizer: any;
  dataUpload: any;
  languages: Array<any>;
  selectedLanguage: any;
  NextMessageArray: any;
  nextMsg: any;
  headerMsg: any;
  languageCode: string;
  title: string = "";
  previousQuery: string = "";
  constructor(
    private router: Router,
    private http: HttpClient,
    private media: Media,
    private androidPermissions: AndroidPermissions,
    private printer: Printer,
    private file: File,
    private diagnostic: Diagnostic,
    private fileOpener: FileOpener,
    private loadingCtrl: LoadingController
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
      this.title = data['title'];
    }
    this.languages = [{name: "English", code: 'en', selected: false}, {name: "Hindi", code:'hi', selected: false}
    // {name: "Kannada", code:'kn', selected: false},  {name: "Telugu", code:'te', selected: false}
  ]
    this.extraOptions = 
    (this.title == 'TeachMate') ?
    [{icon: '', name: 'Teacher Aid'},
    {icon: '', name: 'Stories'}, 
    {icon: '', name: 'Assessments'},
    {icon: "add", name: "add", id: 'trigger-button', 
      quickActions: [ 
        {name: 'Explain more'}, 
        {name: 'Assignments'},
        {name: "Read Aloud"}, 
        {name: "Print and Download"}
      ]
    }] 
    : 
    [{icon: '', name: 'Quick Revision'},
    {icon: '', name: 'Stories'}, 
    {icon: '', name: 'Quiz'},
    {icon: "add", name: "add", id: 'trigger-button', 
      quickActions: [ 
        {name: 'Explain more'}, 
        {name: 'Important Words'}, 
        {name: "Read Aloud"}, 
        {name: "Print and Download"}
      ]
    }]
  }
  rx = /\d+[.):] [^\n]*/g;
  // rx = /[- [\w]+|\d|\w]+[.):] [^\n]*/g;
  moreOption = false;
  ngOnInit() {
  }

  languageSelected(lang: any) {
    this.languages.forEach(lan => {
      if(lang.name === lan.name && lan.selected) {
        this.selectedLanguage = lan.name;
        this.languageCode = lan.code;
        this.content.scrollToBottom(100).then(() => {
          this.content.scrollToBottom(100)
        });
        this.disableSelect = false;
      }
    })
  }

  // ionViewWillEnter() {
  //   let ele = document.getElementById("hint")
  //   console.log('evenet ele', ele);
  //   ele.addEventListener("touchstart", () => {
  //     this.startRecording();
  //   });
  // }

  async askQuestion() {
    if (this.selectedLanguage && this.question?.trim()) {
      (window as any).Keyboard.hide();
      this.nextMsg = "";
      let msg;
      console.log('height', document.body.scrollHeight);
      this.content.scrollToBottom(100).then(() => {
        this.content.scrollToBottom(100)
      });
      msg = { text: this.question, response:this.question, moreArray: [], from: Creator.Me, innerHtml: false, htmltext:'', moreOption: false };
      this.messages.push(msg);
      this.disableSelect = true;
      console.log('this.details.gradeLevel',  this.details.gradeLevel)
      // var uuid_number = this.details?.gradeLevel?.toLowerCase().includes('class 8') ? '4c67c7f4-0919-11ee-9081-0242ac110002' : '8800c6da-0919-11ee-9081-0242ac110002';
      this.question = (this.question+` in ${this.selectedLanguage}`).split(' ').join('%20');
      let url = `${environment.baseUrl}=${this.question}`;
      console.log('url is', url)
      this.question = "";
      this.handleApiCall(url, '');
    }
  }
  chatStream(url: any) {
    return new Observable<string>((observer: any) => {
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!response.ok) {
           // handle response error 
           console.log('error ');
           observer.error();
        }

        function push() {
          return reader?.read().then(({ done, value }) => {
            if (done) {
              observer.complete();
              return;
            }
            //parse text content from response
            const events = decoder.decode(value);
            let content = '';
            for (let i = 0; i < events.length; i++) {
              const event = events[i];
              content += event;
            }
            observer.next(content);
            push();
          });
        }

        push();
      }).catch((err: Error) => {
        // handle fetch error
        observer.error(err);
      });
    });
  }

  async selectedOptions(option: any, dismiss: boolean) {
    console.log('option ', option);
    if(dismiss) {
      await this.popover.dismiss();
      this.disableSelect = false;await this.popover.dismiss();
      this.disableSelect = false;
    }
    this.getAPIforTeacherAid(option);
  }


  getAPIforTeacherAid(type: any) {
    let query = '';
    let textmsg = '';
    this.disableSelect = true;
    switch(type.name) {
      case 'Teacher Aid':
        query = `Teacher aid with simple examples done in the classroom to teach ${this.chapterName}`;
        textmsg = `Teacher aid ${this.chapterName}`;
        break;
      case 'Stories':
        query = this.title== 'TeachMate' ? `A simple story in 150 words which can help to teach ${this.chapterName}`: `As a student, To help understand ${this.chapterName} a simple story in 150 words`;
        textmsg = this.title== 'TeachMate' ? `Story to teach ${this.chapterName}` : `Story to understand ${this.chapterName}`
        break;
      case 'Assessments':
        query = `generate 5 MCQs on ${this.chapterName} with answers`;
        textmsg = `Assessments for my class for ${this.chapterName}`
        break;
      case "add":
        this.quickActions = type.quickActions;
        this.disableSelect = false
        break;
      case 'Explain more':
        query = this.title== 'TeachMate' ? `explain more about the ${this.chapterName} in simple words with examples in 100 words` : `As a student, explain more about the ${this.chapterName} in simple words with examples in 100 words`;
        textmsg = `Explain more ${this.chapterName}`;
        break;
      case 'Assignments':
        query = `generate 3 assignments which can be given as homework for ${this.chapterName}`;
        textmsg = `Assignments and Homework for my class for ${this.chapterName}`
        break;
      case "Know more":
        this.getMoreInfo()
        break;
      case "Read Aloud":
        this.readAloud();
        break;
      case "Print and Download": 
        this.handlePrint();
        break;
      case "Quiz":
        query = `As a student, generate 5 MCQs on ${this.chapterName}`
        textmsg = `Quiz for ${this.chapterName}`
        break;
      case "Quick Revision":
        query = `As a student, For ${this.chapterName}, give summary in bullet points, important questions with answers, and real-life examples in simple english in bullet points`
        textmsg = `Quick revision for ${this.chapterName}`
        break;
      case "Important Words":
        query = `As a student, for ${this.chapterName} give a few important words with meaning and examples`
        textmsg = `Important words for ${this.chapterName}`
        break;
    }
    if (textmsg && query) {
      let msg = { text: `${textmsg}`, response: `${textmsg}`, moreArray: [''], from: Creator.Me, innerHtml: false, htmltext:'', moreOption: false };
      this.previousQuery = query;
      this.messages.push(msg);
      this.content.scrollToBottom(100).then(()=>{
        this.content.scrollToBottom(100);
      })
      query = (query+` in ${this.selectedLanguage}`).split(' ').join('%20');
      let url = environment.baseUrl+'='+query;
      console.log('url ', url)
      this.handleApiCall(url, type.name);
    }
  }

  getMoreInfo() {
    if (this.headerMsg) {
      let query = `Tell me more about ${this.headerMsg}`;
      let msg = { text: query, response: '', moreArray: [''], from: Creator.Me, innerHtml: false, htmltext:'', moreOption: false }
      this.messages.push(msg);
      query = (query+` in ${this.selectedLanguage}`).split(' ').join('%20');
      let url = environment.baseUrl+'='+query;
      console.log('url ', url)
      this.handleApiCall(url)
    }
  }

  handleApiCall(url: any, type?: any) {
    let msg;
    msg = { text: '', response: '', moreArray: [], from: Creator.Bot, innerHtml: false, htmltext:'', moreOption: true };
    this.messages.push(msg);
    this.content.scrollToBottom(100).then(()=>{
      this.content.scrollToBottom(100);
    })
    this.nextMsg = "";
    let array = '';
    let botMsg: string = '';
    let textArray = false;
    this.chatStream(url).subscribe({
      next: (text: any) => {
        let msgText = this.messages[this.messages.length-1];
        array += text
        if(type == 'Explain more' || type == 'Stories') {
          if (array.length > 100 || /\n/g.test(array) || /- /g.test(array) || /\d+[.:]/g.test(array) || /[A-Za-z]\d/g.test(array)) {
            textArray = true;
            msgText.moreArray.push(botMsg.substring(0, botMsg.length - 1));
            msgText.moreOption = true;
            this.content.scrollToBottom(300).then(() => {
              this.content.scrollToBottom(300)
            })
            array = array.substring(array.length - 1)
            botMsg = botMsg.substring(botMsg.length - 1)
          }
        } else {
          if (/- /g.test(array) || /\d+[.:]/g.test(array) || /[A-Za-z]\d/g.test(array)) {
            textArray = true;
            msgText.moreArray.push(botMsg.substring(0, botMsg.length - 1));
            msgText.moreOption = true;
            this.content.scrollToBottom(300).then(() => {
              this.content.scrollToBottom(300)
            })
            array = array.substring(array.length - 1)
            botMsg = botMsg.substring(botMsg.length - 1)
          } else if(/\d[.] [A-Za-z][.]/g.test(array)) {
            textArray = true;
            msgText.moreArray.push(botMsg.substring(0, botMsg.length - 3));
            msgText.moreOption = true;
            this.content.scrollToBottom(300).then(() => {
              this.content.scrollToBottom(300)
            })
            array = array.substring(array.length - 1)
            botMsg = botMsg.substring(botMsg.length - 3)
          }
        }
        botMsg += text;
        if(!textArray) {
          msgText.text = botMsg.substring(0, botMsg.length - 1)
          this.nextMsg = botMsg.substring(0, botMsg.length - 1)
          this.content.scrollToBottom(300).then(() => {
            this.content.scrollToBottom(300)
          })
        }
        msgText.response += text
      },
      complete: () => {
        this.messages[this.messages.length-1].moreArray.push(botMsg);
        this.messages[this.messages.length-1].moreOption = true;
        this.content.scrollToBottom(300).then(() => {
          this.content.scrollToBottom(300)
        })
        if (this.messages[this.messages.length-1].moreArray.length == 0 || this.messages[this.messages.length-1].moreArray[0] == "") {
          this.messages[this.messages.length-1].moreOption = false;
          this.messages[this.messages.length-1].text = 'No Response';
        }
        this.disableSelect = false;
        console.log('stream api complete response ', this.messages[this.messages.length-1]);
      },
      error: (e) => {
        this.disableSelect = false;
        console.log('stream api error response ', e);
      }
    });
  }

  // ModifyResponseForUI(test: any) {
  //   let responseData: any
  //   if (test.includes('Assignment 1:')) { 
  //     let regex = /Assignment\s(\d)[:]/g
  //     let header = Array.from(test.matchAll(regex)).filter((sentence: any) => sentence[0][0]).map((sentence: any) => `${sentence[0]}`)
  //     let d = test.split(regex)
  //     let i = 0;
  //      d.forEach((ele: any) => {
  //        if (!parseInt(ele)) {
  //          if (ele) {
  //            header[i] = header[i].concat(ele);
  //            i++
  //          }
  //        }
  //      })
  //      console.log(header)
  //     responseData = header;
  //   } else {
  //     const data = Array.from(test.matchAll(this.rx)).filter((sentence: any) => sentence[0]).map((sentence: any) => `${sentence}`)
  //     console.log('data ', data)
  //     const dataEx = test.split(/\d+. [^\n]*/g)
  //     console.log('dataEx after replace ', dataEx)
  //     data.forEach((ele, index) => {
  //       if (dataEx[index+1] != '') {
  //         data[index] = ele + dataEx[index+1];
  //       } else {
  //         data[index] = ele
  //       }
  //     })
  //     data[0] = dataEx[0]+(data[0] ? data[0] : '')
  //     console.log('data ', data, data.length > 1);
  //     responseData = data;
  //   }
  //   this.moreOption = responseData.length > 1 ? true : false;
  //   this.messages[this.messages.length-1].moreOption = this.moreOption;
  //   const header = Array.from(responseData[0].matchAll(this.rx), (m: any) => m[0].split(":")[0].split('.')[1])
  //   console.log(header)
  //   this.content.scrollToBottom(100).then(()=>{
  //     this.content.scrollToBottom(100);
  //   })
  //   this.NextMessageArray = responseData;
  //   this.nextMsg = responseData[0];
  //   this.headerMsg = header[0] ? header[0] : '';
  //   console.log('responseData[0] ', responseData[0], responseData[0].length);
  //   if(responseData.length == 1) {
  //     let response: any = responseData[0].length > 100 ? responseData[0].match(/.{1,100}/g) : responseData[0];
  //     console.log('response story ', response);
  //     this.NextMessageArray = response
  //     if(response.length) {
  //       this.messages[this.messages.length-1].moreOption = true;
  //       this.nextMsg = response[0];
  //       this.messages[this.messages.length-1].text = response[0];
  //     }
  //   } else {
  //     this.messages[this.messages.length-1].text = responseData[0] ? responseData[0] : 'No Response';
  //   }
  // }

  async readAloud() {
    let text = this.messages[this.messages.length-1].innerHtml ? this.messages[this.messages.length-1].htmltext : this.messages[this.messages.length-1].text;
    console.log('text ', this.messages,  text.replace(/\d/g, ''));
    let convertedText = text.replace('\n', '');
    console.log('text ', convertedText);
    const loading = await this.loadingCtrl.create({
      message: 'Crafting ...',
    });
    loading.present();
    let body = {"controlConfig":{"dataTracking":true},"input":[{"source": convertedText}],"config":{"gender":"female","language":{"sourceLanguage": `${this.languageCode}`}}}
    try {
      this.http.post('https://demo-api.models.ai4bharat.org/inference/tts', body, {headers: {"content-type":"application/json"}, responseType:"json"})
      .subscribe((res: any) => {
        console.log('read aloud base64 data ', res);
        if(res?.audio[0]?.audioContent) {
          this.convertBase64toAudio(res)
          if (loading) {
            loading.dismiss();
          }
        } else {
          if (loading) {
            loading.dismiss();
          }
          this.disableSelect = false;
        }
      })
    } catch(err: any) {
      console.log('.....................', err)
      alert('Error');
      this.disableSelect = false;
    }
  }

  convertBase64toAudio(data: any) {
    let src = `data:audio/${data.config.audioFormat};base64,` + data.audio[0].audioContent;
    this.disableSelect = true;
    console.log('src ', src);
    let snd = new Audio();
    snd.addEventListener('ended', () => {
      console.log('snd1 ended ', snd);
      this.disableSelect = false;  
    })
    snd.src = src;
    let ele = document.getElementsByTagName("audio");
    console.log('duration ', ele)
    console.log('snd ', snd);
    snd.play();
  }

  handlePrint() {
    let msg = this.messages[this.messages.length-1]
    let textmsg = msg.response ? msg.response : msg.innerHTML;
    let options: any = {
      font: {
          size: 22,
          italic: true,
          align: 'center',
          bold: false,
      },
      margin: true,
      header: {
          height: '6cm',
          label: {
              text: "ED-Saathi",
              font: {
                size: 37,
                italic: false,
                align: 'center',
                bold: true,
              },
          }
      }
    };
    this.disableSelect = false;
    this.printer.isAvailable().then(() => {
      this.printer.print(`${textmsg}`, options).then(() => {
        console.log("printing done successfully !");
      },() => {
        alert("Error while printing !");
      });
    }, (err) =>{
      alert('Error : printing is unavailable on your device '+ err);
    });
  }

  nextMsgData(msg: any) {
    console.log('next message ', this.nextMsg);
    console.log('message ', msg);
    let lastmsg = this.messages[this.messages.length-1];
    if (lastmsg.from == Creator.Bot && lastmsg.text && lastmsg.text !== 'No Response') {
      let index: number = 0
      let msgArr = '';
      msg.moreArray.forEach((nxt: any, i: any) => {
        msgArr += nxt;
        if(this.nextMsg === nxt && msgArr === msg.text) {
          console.log('if ', i, msg.moreArray.length, nxt);
          index = i
          this.nextMsg = ''
        }
      })
      if(msg.moreArray[index+1] && this.nextMsg !== msg.moreArray[index+1]) {
        console.log('if condt next index ', msg.moreArray[index+1], this.nextMsg !== msg.moreArray[index+1]);
        this.nextMsg = ''
        this.nextMsg = msg.moreArray[index+1];
        // let mArray = msg.moreArray[index+1].split(' ')
        // console.log('mArray ', mArray);
        // const dataStream = Readable.from(msg.moreArray[index+1])
        // console.log('data stream  ', dataStream)
        // mArray.forEach((arr: any) => {
        //   // console.log('******* ', arr);
        //   msg.text += ' ' + arr;
        //   // console.log('******* msg ', msg.text);
        // })
        msg.text += msg.moreArray[index+1]
      }
      if(index+1 == msg.moreArray.length-1) {
        msg.moreOption = false;
      }
      this.content.scrollToBottom(100).then(()=>{
        this.content.scrollToBottom(100);
      })
      console.log('msg next ', msg)
    }
  }

  // // downlaod option
  // downloadData() {
  //   let msg = this.messages[this.messages.length-1]
  //   let textmsg = msg.rersponse ? msg.response : msg.innerHTML;
  //   console.log('download data');
  //   const directory = this.file.externalDataDirectory;
  //   const fileName = 'user-data.pdf';
  //   const permissionsArray = [
  //     this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
  //     this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
  //   ]
  //   this.androidPermissions
  //     .requestPermissions(permissionsArray)
  //     .then((successResult) => {
  //       console.log('android permissions data');
  //       if (successResult.hasPermission) {
  //         let options: IWriteOptions = {
  //           replace: true,
  //         };
  //         this.file
  //           .checkFile(directory, fileName)
  //           .then((res) => {
  //             console.log('file check ', res)
  //             this.file
  //             .writeFile(directory, fileName, textmsg, options)
  //             .then((res) => {
  //               console.log('File generated' + JSON.stringify(res));
  //               this.fileOpener
  //                 .open(res.nativeURL, 'application/pdf')
  //                 .then(() => console.log('File is exported'))
  //                 .catch((e) => {console.log(e)
  //                   alert('Error'+e?.message)
  //                 });
  //             })
  //             .catch((error) => {
  //               console.log(JSON.stringify(error));
  //             });
  //           })
  //           .catch((error) => {
  //             console.log('fiel ccheck erroe ')
  //             this.file
  //               .writeFile(cordova.file.externalDataDirectory, fileName, textmsg)
  //               .then((res) => {
  //                 console.log('File generated' + JSON.stringify(res));
  //                 this.fileOpener
  //                   .open(res.nativeURL, 'application/pdf')
  //                   .then(() => console.log('File exported'))
  //                   .catch((e) => {console.log(e) 
  //                     alert('Error'+e?.message)});
  //               })
  //               .catch((error) => {
  //                 console.log(JSON.stringify(error));
  //               });
  //           });
  //       }
  //     }).catch(err => {
  //       console.log('android permissions error');
  //     })
  // }
  // previousMsgData() {
  //   let lastmsg = this.messages[this.messages.length-1];
  //   if (lastmsg.from == Creator.Bot && lastmsg.text && lastmsg.text !== 'No Response') {
  //     let index: number = 0
  //     console.log('on prev ', this.nextMsg)
  //     this.NextMessageArray.forEach((nxt: any, i: any) => {
  //       if(nxt === this.nextMsg) {
  //         console.log('prev index ', i);
  //         index = i-1;
  //       }
  //     })
  //     if (index >= 0) {
  //       lastmsg.text = ''
  //       this.NextMessageArray.forEach((nxt: any, i: any) => {
  //         if(i <= index) {
  //           this.nextMsg = nxt;
  //           this.headerMsg = Array.from(this.nextMsg.matchAll(this.rx), (m: any) => m[0].split(":")[0].split('.')[1])
  //           lastmsg.text += '\n' + nxt
  //         }
  //       })
  //     }
  //   }
  // }

  // recordSpeech(e: any) {
  //   (window as any).Keyboard.hide();
  //   this.ionViewWillEnter()
  //   console.log('record ', e)
  // }

  // async closeHintPopover(e: any) {
  //   await this.popoverhint.dismiss();
  // }

  // checkRecordMediaPermission() {
  //   this.diagnostic
  //     .isMicrophoneAuthorized()
  //     .then((success) => {
  //       this.diagnostic
  //         .requestMicrophoneAuthorization()
  //         .then((success) => {
  //           if (success === "authorized" || success === "GRANTED") {
  //             const permissionsArray = [
  //               this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
  //               this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
  //               this.androidPermissions.PERMISSION.RECORD_AUDIO,
  //             ];
  //             this.androidPermissions
  //               .requestPermissions(permissionsArray)
  //               .then((successResult) => {
  //                 successResult.hasPermission
  //                   ?? this.startRecording()
  //               })
  //               .catch((error) => {
  //                 // this.toast.openToast(
  //                 //   "Please accept the permissions to use this feature"
  //                 // );
  //               });
  //           } else {
  //             // this.toast.openToast(
  //             //   "Please accept the permissions to use this feature"
  //             // );
  //           }
  //         })
  //         .catch((error) => {
  //           console.log("Please accept the permissions to use this feature");
  //         });
  //     })
  // }

  // timerId: any;
  // async startRecording() {
  //   this.checkRecordMediaPermission();
  //   this.recording = true;
  //   console.log('start recording')
  //   var counter1 = 0;
  //   let cnt2 = 0;
  //   let cnt3 = 0;
  //   this.timerId = setInterval(() => {
  //     counter1++;
  //     if (counter1 > 0 && counter1<=59) {
  //       let span = document.getElementById("timer");
  //       span.innerHTML = cnt3 + ':' + cnt2 + ':' + counter1;
  //     } else {
  //       counter1 = 0;
  //       cnt2++;
  //       if(cnt2 > 59) {
  //         cnt2 = 0;
  //         cnt3++;
  //       }
  //     }
  //   }, 1000);
  //   this.file
  //   .checkDir(this.file.externalDataDirectory, "audio")
  //   .then((success) => {
  //     console.log('file checck success ', success);
  //     this.fileName =
  //       "record" +
  //       new Date().getDate() +
  //       new Date().getMonth() +
  //       new Date().getFullYear() +
  //       new Date().getHours() +
  //       new Date().getMinutes() +
  //       new Date().getSeconds() +
  //       ".wav";
  //     this.filesPath =
  //       this.file.externalDataDirectory + "audio/" + this.fileName;
  //     this.audio = this.media.create(this.filesPath);
  //     console.log('audio ', this.audio);
  //     this.audio.startRecord();
  //     let duration = this.audio.getDuration();
  //     console.log('duration ', duration);
  //   })
  //   .catch((err) => {
  //     console.log('file check error ', err);
  //     this.file.createDir(cordova.file.externalDataDirectory, "audio", false)
  //     .then(
  //       (success) => {
  //         console.log('file create success ', success);
  //         this.fileName =
  //           "record" +
  //           new Date().getDate() +
  //           new Date().getMonth() +
  //           new Date().getFullYear() +
  //           new Date().getHours() +
  //           new Date().getMinutes() +
  //           new Date().getSeconds() +
  //           ".wav";
  //         this.filesPath =
  //           this.file.externalDataDirectory + "audio/" + this.fileName;
          
  //           console.log('file path ', this.filesPath);
  //         this.audio = this.media.create(this.filesPath);
  //         this.audio.startRecord();
  //         let duration = this.audio.getDuration();
  //         console.log('duration 1 ', duration);
  //       },
  //       (error) => { 
  //         console.log('file create error ', error);
  //       }
  //     );
  //     })
  // }

  // async stopRecording() {
  //   this.recording = false;
  //   console.log('stop recording ', this.audio);
  //   clearInterval(this.timerId);
  //   this.audio.stopRecord();
  //   let duration = this.audio.getDuration();
  //   console.log('duration 2 ', duration);
  //   this.audio.play();
  //   this.audio.release();
  //   // this.file.readAsDataURL(this.file.externalDataDirectory + "audio/", this.fileName)
  //   // .then((base64Audio) => {
  //   //   console.log('base64 audio ', base64Audio);
  //   // })
  //   // .catch(function (err: TypeError) {
  //   //   console.log("readAsDataURL: " + err);
  //   // });

  //   let res = await this.file.readAsDataURL(this.file.externalDataDirectory + "audio/", this.fileName)
  //   console.log('base64 string ', res);
  //   // var x = res.substr(13,res.length);
  //   // x = "data:audio/mpeg;base64" + x;
  //   // console.log('x ', x)
  //   this.getStringFormAPI(res);
  //   // let reader = new FileReader();
  //   // reader.readAsDataURL(this.fileName);
  //   // reader.onload = () => {
  //   //   let base64 = reader.result // Here is your base64.
  //   //   console.log('base64 strr ', base64);
  //   // }
  // }

  // getStringFormAPI(base64Audio: any) {
  //   let myHeaders = new HttpHeaders();
  //   myHeaders.append("Content-Type", "application/json");
  //   let payload = JSON.stringify({
  //     config: {
  //       language: {
  //         sourceLanguage: this.selectedLanguage ? this.selectedLanguage : 'English',
  //       },
  //       transcriptionFormat: {
  //         value: "transcript",
  //       },
  //       audioFormat: "wav",
  //       samplingRate: 30000,
  //       postProcessors: null,
  //     },
  //     audio: [
  //       {
  //         audioContent: base64Audio,
  //       },
  //     ],
  //   });
  //   let requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: payload,
  //     redirect: "follow",
  //   };
  //   // fetch('https://asr-api.ai4bharat.org/asr/v1/recognize/en', requestOptions).then(response => console.log(response))
  //   this.http.post('https://asr-api.ai4bharat.org/asr/v1/recognize/en', payload, {headers:myHeaders, responseType: 'json' }).
  //   subscribe((res: any) => {
  //     console.log('api response', res)
  //   })
  // }

  // pauseRecording() {
  //   this.pause = true
  //   this.audio.pauseRecord();
  //   console.log('pause recording')
  // }

  // resumeRecording() {
  //   this.pause = false;
  //   this.audio.resumeRecord();
  // }
  
  // deleteRecording() {
  //   this.recording = false;
  //   console.log('delete recording');
  // }

    // navigateToContentDetails(chip: any) {
  //   let quetionUrl;
  //   this.selectedChip = chip.type;
  //   this.disableSelect = true;
  //   this.contents.forEach(cont => {
  //     if (cont.type == chip.type) {
  //       cont.selected = (cont.type == chip.type) ? true : false;
  //       quetionUrl = cont.question.split(' ').join('%20')
  //       console.log(cont, 'cont');
  //     }
  //   });
  //   var uuid_number = this.details?.gradeLevel?.toLowerCase().includes('class 8') ? '4c67c7f4-0919-11ee-9081-0242ac110002' : '8800c6da-0919-11ee-9081-0242ac110002';
  //   let url = `${environment.questionGptUrl}?uuid_number=${uuid_number}&query_string=${quetionUrl}`;
  //   // let url = `${environment.questionGptUrl}=${quetionUrl}`;
  //   console.log(url, 'url');
  //   this.getData(url);
  // }

  // getData(url: any) {
  //   let msg = { text: '', from: Creator.Bot, innerHtml: false, htmltext:'' }
  //   this.messages.push(msg);
  //   this.http.get(url, { responseType: 'json' }).subscribe((res: any) => {
  //     console.log('res ', res);
  //     this.content.scrollToBottom(100);
  //     this.messages[this.messages.length-1].text = res && res.answer ? res['answer'] : "No Response";
  //     this.disableSelect = false;
  //     let arr: Array<string> = [];
  //     switch(this.selectedChip) {
  //       case "Quiz":
  //         arr = ["Practice Resource", "Practice Question Set"];
  //         break;
  //       case "Summary":
  //       case "Important Words":
  //         arr = ["Explanation Content"];
  //         break;
  //       case "Teacher Aid":
  //         arr = ["Teacher Resource"];
  //       break;
  //     }
  //     let msg = {text: '', from: Creator.Bot, innerHtml: true, htmltext:''}
  //     this.messages.push(msg);
  //     this.getContentDetails(arr).subscribe((data) => {
  //       console.log('teacherrrrrrrr', data)
  //       this.content.scrollToBottom(100);
  //       let output = `<div style="width: 100%; color: black"> <p>Here are courses which can help you learn more about this chapter:<p>`;
  //       let dataText = 'Here are courses which can help you learn more about this chapter'
  //       data.result.content.forEach(item => {
  //         output += `<p style="color: black"><a href='https://diksha.gov.in/explore-course/course/${item.identifier}'>${item.name}</a></p>`
  //         dataText += item.name
  //       });
  //       output +=`</div>`
  //       console.log('output', output);
  //       msg.htmltext = dataText;
  //       let id = 'chip'+ (this.messages.length - 1)
  //       let ele = document.getElementById(id);
  //       console.log(ele, 'ele');
  //       if (ele) {
  //         ele.innerHTML = output;
  //       }
  //     })
  //   })
  // }

  // getContentDetails(primaryCategories: Array<string>) {
  //   return this.http.post<Response>(environment.teacherBaseUrl, {
  //       "request": {
  //         "filters": {
  //           "primaryCategory": primaryCategories

  //         },
  //         "limit": 10,
  //         "query": this.chapterName,
  //         "sort_by": {
  //           "lastPublishedOn": "desc"
  //         },
  //         "fields": [
  //           "name",
  //           "identifier",
  //           "contentType"
  //         ],
  //         "softConstraints": {
  //           "badgeAssertions": 98,
  //           "channel": 100
  //         },
  //         "mode": "soft",
  //         "facets": [
  //           "se_boards",
  //           "se_gradeLevels",
  //           "se_subjects",
  //           "se_mediums",
  //           "primaryCategory"
  //         ],
  //         "offset": 0
  //       }
  //   });
  // }
}
