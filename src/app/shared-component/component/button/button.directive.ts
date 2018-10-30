import { style } from '@angular/animations';
import { Directive, ElementRef, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { DomHandler } from './../../common/api';

@Directive({
    selector: '[pButton]',
    providers: [DomHandler]
})
export class ButtonDirective implements AfterViewInit, OnDestroy {

    @Input() iconPos = 'left';

    @Input() cornerStyleClass = 'ui-corner-all';

    public _label: string;

    public _icon: string;

    public initialized: boolean;

    constructor(public el: ElementRef, public domHandler: DomHandler) { }

    ngAfterViewInit() {
        this.domHandler.addMultipleClasses(this.el.nativeElement, this.getStyleClass());
        if (this.icon) {
            let iconElement = document.createElement('span');
            let iconPosClass = (this.iconPos === 'right') ? 'ui-button-icon-right' : 'ui-button-icon-left';
            iconElement.className = iconPosClass + ' ui-clickable fa fa-fw ' + this.icon;
            this.el.nativeElement.appendChild(iconElement);
        }

        let labelElement = document.createElement('span');
        labelElement.className = 'ui-button-text ui-clickable';
        labelElement.appendChild(document.createTextNode(this.label || 'ui-btn'));
        this.el.nativeElement.appendChild(labelElement);
        this.initialized = true;
    }

    getStyleClass(): string {
        let styleClass = 'ui-button ui-widget ui-state-default ' + this.cornerStyleClass;
        if (this.icon) {
            if (this.label != null && this.label !== undefined) {
                if (this.iconPos === 'left') {
                    styleClass = styleClass + ' ui-button-text-icon-left';
                } else {
                    styleClass = styleClass + ' ui-button-text-icon-right';
                }
            } else {
                styleClass = styleClass + ' ui-button-icon-only';
            }
        } else {
            if (this.label) {
                styleClass = styleClass + ' ui-button-text-only';
            } else {
                styleClass = styleClass + ' ui-button-text-empty';
            }
        }

        return styleClass;
    }

    @Input() get label(): string {
        return this._label;
    }

    set label(val: string) {
        this._label = val;

        if (this.initialized) {
            this.domHandler.findSingle(this.el.nativeElement, '.ui-button-text').textContent = this._label;

            if (!this.icon) {
                if (this._label) {
                    this.domHandler.removeClass(this.el.nativeElement, 'ui-button-text-empty');
                    this.domHandler.addClass(this.el.nativeElement, 'ui-button-text-only');
                }
                else {
                    this.domHandler.addClass(this.el.nativeElement, 'ui-button-text-empty');
                    this.domHandler.removeClass(this.el.nativeElement, 'ui-button-text-only');
                }
            }
        }
    }

    @Input() get icon(): string {
        return this._icon;
    }

    set icon(val: string) {
        this._icon = val;

        if (this.initialized) {
            let iconPosClass = (this.iconPos === 'right') ? 'ui-button-icon-right' : 'ui-button-icon-left';
            this.domHandler.findSingle(this.el.nativeElement, '.fa').className =
                iconPosClass + ' ui-clickable fa fa-fw ' + this.icon;
        }
    }

    ngOnDestroy() {
        while (this.el.nativeElement.hasChildNodes()) {
            this.el.nativeElement.removeChild(this.el.nativeElement.lastChild);
        }

        this.initialized = false;
    }
}