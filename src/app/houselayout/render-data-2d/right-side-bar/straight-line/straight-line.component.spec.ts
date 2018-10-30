import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StraightLineComponent } from './straight-line.component';

describe('StraightLineComponent', () => {
  let component: StraightLineComponent;
  let fixture: ComponentFixture<StraightLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StraightLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StraightLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
