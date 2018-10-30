import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoorWindowComponent } from './door-window.component';

describe('DoorWindowComponent', () => {
  let component: DoorWindowComponent;
  let fixture: ComponentFixture<DoorWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoorWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoorWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
