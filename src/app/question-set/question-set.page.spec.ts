import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionSetPage } from './question-set.page';

describe('QuestionSetPage', () => {
  let component: QuestionSetPage;
  let fixture: ComponentFixture<QuestionSetPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(QuestionSetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
