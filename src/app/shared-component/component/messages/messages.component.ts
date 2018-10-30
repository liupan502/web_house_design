import { Component, OnDestroy, Input, Output, EventEmitter, Optional } from '@angular/core';
import { MessageService, Message } from './../../common/api';
import { Subscription } from 'rxjs/Subscription';


@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnDestroy {

    @Input() value: Message[];

    @Input() closable: boolean = true;

    @Output() valueChange: EventEmitter<Message[]> = new EventEmitter<Message[]>();

    subscription: Subscription;

    constructor( @Optional() public messageService: MessageService) {
        if (messageService) {
            this.subscription = messageService.messageObserver.subscribe((messages: any) => {
                if (messages) {
                    if (messages instanceof Array) {
                        this.value = this.value ? [...this.value, ...messages] : [...messages];
                    } else {
                        this.value = this.value ? [...this.value, ...[messages]] : [messages];
                    }
                } else {
                    this.value = null;
                }
            });
        }
    }

    hasMessages() {
        return this.value && this.value.length > 0;
    }

    getSeverityClass() {
        return this.value[0].severity;
    }

    clear(event) {
        this.value = [];
        this.valueChange.emit(this.value);

        event.preventDefault();
    }

    get icon(): string {
        let icon: string = null;
        if (this.hasMessages()) {
            let msg = this.value[0];
            switch (msg.severity) {
                case 'success':
                    icon = 'fa-check';
                    break;

                case 'info':
                    icon = 'fa-info-circle';
                    break;

                case 'error':
                    icon = 'fa-close';
                    break;

                case 'warn':
                    icon = 'fa-warning';
                    break;

                default:
                    icon = 'fa-info-circle';
                    break;
            }
        }

        return icon;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
