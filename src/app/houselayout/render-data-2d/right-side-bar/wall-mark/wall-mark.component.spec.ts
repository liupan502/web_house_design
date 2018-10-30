import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WallMarkComponent } from './wall-mark.component';

describe('WallMarkComponent', () => {
  let component: WallMarkComponent;
  let fixture: ComponentFixture<WallMarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallMarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
