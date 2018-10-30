import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.css']
})
export class ButtonComponent {
    @Input() type = 'button';

    @Input() iconPos = 'left';

    @Input() icon: string;

    @Input() label: string;

    @Input() disabled: boolean;

    @Input() style: any;

    @Input() styleClass: string;

    @Output() onClick: EventEmitter<any> = new EventEmitter();

    @Output() onFocus: EventEmitter<any> = new EventEmitter();

    @Output() onBlur: EventEmitter<any> = new EventEmitter();

}
