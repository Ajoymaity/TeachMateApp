import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChapterDetailsOptionPage } from './chapter-details-option.page';

describe('ChapterDetailsOptionPage', () => {
  let component: ChapterDetailsOptionPage;
  let fixture: ComponentFixture<ChapterDetailsOptionPage>;

  beforeEach((() => {
    fixture = TestBed.createComponent(ChapterDetailsOptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
