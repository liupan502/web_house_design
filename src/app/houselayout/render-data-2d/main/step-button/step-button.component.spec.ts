import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepButtonComponent } from './step-button.component';

describe('StepButtonComponent', () => {
  let component: StepButtonComponent;
  let fixture: ComponentFixture<StepButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
