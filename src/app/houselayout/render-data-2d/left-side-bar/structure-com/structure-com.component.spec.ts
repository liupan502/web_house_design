import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureComComponent } from './structure-com.component';

describe('StructureComComponent', () => {
  let component: StructureComComponent;
  let fixture: ComponentFixture<StructureComComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureComComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureComComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
