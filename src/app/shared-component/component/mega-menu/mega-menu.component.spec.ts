import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MegaMenuComponent} from './mega-menu.component';

describe('MegamenuComponent', () => {
    let component: MegaMenuComponent;
    let fixture: ComponentFixture<MegaMenuComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MegaMenuComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MegaMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
