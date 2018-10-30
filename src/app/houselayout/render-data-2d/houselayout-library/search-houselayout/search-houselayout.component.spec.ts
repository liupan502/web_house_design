import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchHouselayoutComponent } from './search-houselayout.component';

describe('SearchHouselayoutComponent', () => {
  let component: SearchHouselayoutComponent;
  let fixture: ComponentFixture<SearchHouselayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchHouselayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchHouselayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
