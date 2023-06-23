import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-question-set',
  templateUrl: './question-set.page.html',
  styleUrls: ['./question-set.page.scss'],
})
export class QuestionSetPage implements OnInit {
  questionSet = [
    {
      query: "When is Earth Day celebrated?", 
      options:[{option:"22 April", selected: false, disabled: false}, {option:"2 April", selected: false, disabled: false}, {option:"5 June", selected: false, disabled: false}, {option:"22 June", selected: false, disabled: false}], 
      correctAnswer: "22 April",
      selectedAnswer: ""
    },
    {
      query: "Name the smallest perfect number?", 
      options:[{option:"6", selected: false, disabled: false}, {option:"1", selected: false, disabled: false}, {option:"4", selected: false, disabled: false}, {option:"3", selected: false, disabled: false}], 
      correctAnswer: "6",
      selectedAnswer: ""
    },
    {
      query: "Which of the following microbe carries malaria?", 
      options:[{option:"Protists", selected: false, disabled: false}, {option:"Butterfly", selected: false, disabled: false}, {option:"Female Anopheles Mosquito", selected: false, disabled: false}, {option:"None of the above", selected: false, disabled: false}], 
      correctAnswer: "Female Anopheles Mosquito",
      selectedAnswer: ""
    },
    {
      query: "Who of the following invented Facebook?", 
      options:[{option:"Benjamin Franklin", selected: false, disabled: false}, {option:"Robert Fulton", selected: false, disabled: false}, {option:"Kevin Systrom", selected: false, disabled: false}, {option:"Mark Zuckerberg", selected: false, disabled: false}], 
      correctAnswer: "Mark Zuckerberg",
      selectedAnswer: ""
    },
    {
      query: "Which of the following is the national sport of Japan?", 
      options:[{option:"Cricket", selected: false, disabled: false}, {option:"Sumo wrestling", selected: false, disabled: false}, {option:"Basketball", selected: false, disabled: false}, {option:"Football", selected: false, disabled: false}], 
      correctAnswer: "Sumo wrestling",
      selectedAnswer: ""
    },
    {
      query: "Which of the following is called wood alcohol?", 
      options:[{option:"Ethyl", selected: false, disabled: false}, {option:"Butanol", selected: false, disabled: false}, {option:"Methanol", selected: false, disabled: false}, {option:"Propyl", selected: false, disabled: false}], 
      correctAnswer: "Methanol",
      selectedAnswer: ""
    },
  ];
  showScore = false;
  score = 0;
  totalScore = 0;
  questionViewed: Array<any> = [{}]
  lastQuestion: boolean = false;
  @ViewChild(IonModal) modal: IonModal;
  constructor() { 
    this.totalScore = this.questionSet.length;
    this.questionViewed = [{index: 0, query: this.questionSet[0].query, options: this.questionSet[0].options}]
  }

  ngOnInit() {
  }

  cancel() {
    if(this.lastQuestion) {
      this.modal.dismiss({score: this.score, total:this.totalScore}, 'cancel');
      this.lastQuestion= false;
      this.showScore = false;
      this.questionViewed = [{index: 0, query: this.questionSet[0].query, options: this.questionSet[0].options}]
    }
  }

  onWillDismiss(event: Event) {
    // const ev = event as CustomEvent<OverlayEventDetail<string>>;
    // if (ev.detail.role === 'confirm') {
    //   this.message = `Hello, ${ev.detail.data}!`;
    // }
  }

  nextQuestion(question: any) {
    console.log('next', this.questionSet);
    let i = question.index;
    let quest = this.questionSet[question.index];
    if(quest.query == question.query) {
      quest.options.forEach(opt => {
        if(opt.selected) {
          quest.selectedAnswer = opt.option;
          i++;
          this.questionViewed = [];
          console.log('index', i, this.questionSet.length);
          if(i < this.questionSet.length) {
            this.questionViewed = [{index: i, query: this.questionSet[i].query, options: this.questionSet[i].options}];
          }
          if (i == this.questionSet.length-1) {
            console.log('set done button', i, this.questionSet.length);
            this.lastQuestion = true
          } else {
            this.lastQuestion = false
          }
        }
      })
    }
  }

  onSelectOption(selOption: any) {
    this.questionViewed[0].options.forEach((opt: any) => {
      if(opt.option !== selOption) {
        opt.disabled = !opt.disabled
      } else {
        opt.selected = !opt.selected
      }
    })
    console.log('viewed q ', this.questionViewed[0].options);
  }

  calculateScore() {
    this.questionSet.forEach(quest => {
      if(quest.selectedAnswer == quest.correctAnswer) {
        this.score++
      }
    })
    this.showScore = true
    console.log('score ', this.score, '/', this.totalScore);
  }
}
