import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoorHoleComponent } from './door-hole.component';

describe('DoorHoleComponent', () => {
  let component: DoorHoleComponent;
  let fixture: ComponentFixture<DoorHoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoorHoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoorHoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
