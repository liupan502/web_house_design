import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyHouselayoutComponent } from './my-houselayout.component';

describe('MyHouselayoutComponent', () => {
  let component: MyHouselayoutComponent;
  let fixture: ComponentFixture<MyHouselayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyHouselayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyHouselayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
