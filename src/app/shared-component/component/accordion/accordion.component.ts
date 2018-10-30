import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { AccordionTabComponent } from '../accordion-tab/accordion-tab.component';

@Component({
    selector: 'app-accordion',
    templateUrl: './accordion.component.html',
    styleUrls: ['./accordion.component.css']
})

export class AccordionComponent {

    @Input() multiple: boolean;

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    @Output() onOpen: EventEmitter<any> = new EventEmitter();

    @Input() style: any;

    @Input() styleClass: string;

    @Input() lazy: boolean;

    private _activeIndex: any;

    public tabs: AccordionTabComponent[] = [];

    constructor(public el: ElementRef) {
    }

    addTab(tab: AccordionTabComponent) {
        this.tabs.push(tab);
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    @Input() get activeIndex(): any {
        return this._activeIndex;
    }

    set activeIndex(val: any) {
        this._activeIndex = val;

        if (this.tabs && this.tabs.length && this._activeIndex != null) {
            for (let i = 0; i < this.tabs.length; i++) {
                let selected, changed;
                selected = this.multiple ? this._activeIndex.includes(i) : (i === this._activeIndex);
                changed = selected !== this.tabs[i].selected;

                if (changed) {
                    this.tabs[i].animating = true;
                }

                this.tabs[i].selected = selected;
                this.tabs[i].selectedChange.emit(selected);
            }
        }
    }
}
