import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleriaComponent } from './galleria.component';

describe('GalleriaComponent', () => {
  let component: GalleriaComponent;
  let fixture: ComponentFixture<GalleriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
