import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentDetailsPage } from './content-details.page';

describe('ContentDetailsPage', () => {
  let component: ContentDetailsPage;
  let fixture: ComponentFixture<ContentDetailsPage>;

  beforeEach((() => {
    fixture = TestBed.createComponent(ContentDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
