import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurlinComponent } from './purlin.component';

describe('PurlinComponent', () => {
  let component: PurlinComponent;
  let fixture: ComponentFixture<PurlinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurlinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurlinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
