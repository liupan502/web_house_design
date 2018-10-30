import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseTypeComponent } from './house-type.component';

describe('HouseTypeComponent', () => {
  let component: HouseTypeComponent;
  let fixture: ComponentFixture<HouseTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
