import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcComponent } from './arc.component';

describe('ArcComponent', () => {
  let component: ArcComponent;
  let fixture: ComponentFixture<ArcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
