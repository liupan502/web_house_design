import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PillarComponent } from './pillar.component';

describe('PillarComponent', () => {
  let component: PillarComponent;
  let fixture: ComponentFixture<PillarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PillarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PillarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
