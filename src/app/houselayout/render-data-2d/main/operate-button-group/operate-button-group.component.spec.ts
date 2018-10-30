import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperateButtonGroupComponent } from './operate-button-group.component';

describe('OperateButtonGroupComponent', () => {
  let component: OperateButtonGroupComponent;
  let fixture: ComponentFixture<OperateButtonGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperateButtonGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperateButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
