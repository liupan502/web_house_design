import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandMarkComponent } from './land-mark.component';

describe('LandMarkComponent', () => {
  let component: LandMarkComponent;
  let fixture: ComponentFixture<LandMarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandMarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
