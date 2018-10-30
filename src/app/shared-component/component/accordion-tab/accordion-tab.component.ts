import { Component, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AccordionComponent } from '../accordion/accordion.component';

@Component({
    selector: 'app-accordion-tab',
    templateUrl: './accordion-tab.component.html',
    styleUrls: ['./accordion-tab.component.css'],
    animations: [
        trigger('tabContent', [
            state('hidden', style({
                height: '0'
            })),
            state('visible', style({
                height: '*'
            })),
            transition('visible <=> hidden', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ]
})
export class AccordionTabComponent implements OnDestroy {

    @Input() header: string;

    @Input() selected: boolean;

    @Input() disabled: boolean;

    @Output() selectedChange: EventEmitter<any> = new EventEmitter();

    public animating: boolean;

    constructor(public accordion: AccordionComponent) {
        this.accordion.addTab(this);
    }

    toggle(event) {
        if (this.disabled || this.animating) {
            return false;
        }

        this.animating = true;
        let index = this.findTabIndex();

        if (this.selected) {
            this.selected = false;
            this.accordion.onClose.emit({originalEvent: event, index: index});
        }
        else {
            if (!this.accordion.multiple) {
                for (let i = 0; i < this.accordion.tabs.length; i++) {
                    this.accordion.tabs[i].selected = false;
                    this.accordion.tabs[i].selectedChange.emit(false);
                }
            }

            this.selected = true;
            this.accordion.onOpen.emit({originalEvent: event, index: index});
        }

        this.selectedChange.emit(this.selected);

        event.preventDefault();
    }

    findTabIndex() {
        let index = -1;
        for (let i = 0; i < this.accordion.tabs.length; i++) {
            if (this.accordion.tabs[i] === this) {
                index = i;
                break;
            }
        }
        return index;
    }

    get lazy(): boolean {
        return this.accordion.lazy;
    }

    onToggleDone(event: Event) {
        this.animating = false;
    }

    ngOnDestroy() {
        this.accordion.tabs.splice(this.findTabIndex(), 1);
    }
}
