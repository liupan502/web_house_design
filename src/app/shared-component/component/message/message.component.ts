import { Component, Input, Output } from '@angular/core';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.css']
})
export class MessageComponent {

    @Input() severity: string;

    @Input() text: string;

    get icon(): string {
        let icon: string = null;

        if (this.severity) {
            switch (this.severity) {
                case 'success':
                    icon = 'fa fa-check';
                    break;

                case 'info':
                    icon = 'fa fa-info-circle';
                    break;

                case 'error':
                    icon = 'fa fa-close';
                    break;

                case 'warn':
                    icon = 'fa fa-warning';
                    break;

                default:
                    icon = 'fa fa-info-circle';
                    break;
            }
        }
        return icon;
    }

}
