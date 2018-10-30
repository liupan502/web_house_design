import {Injectable} from '@angular/core'
import { Subject } from 'rxjs'
import {Subscription} from 'rxjs'
import {MessageManagerService} from './message-manager.service'

type Handler = (object: any) => void;

class MessageHandler {

    readonly handler: Handler;
    readonly target: any;
    constructor(target: any, handler: Handler) {
        this.handler = handler;
        this.target = target;
    }
}


@Injectable()
export class BaseMessageService {
    protected messageSource: Subject<Message> = new Subject<Message>();
    protected messagehandlersMap_: Map<string, Set<MessageHandler>>;
    protected messages$_ = this.messageSource.asObservable();
    protected currentSubscription: Subscription;
    protected id_ = 'baseMessage';
    
    constructor(protected messageManager: MessageManagerService) {
        //this.id_ = 'baseMessage';
        this.messagehandlersMap_ = new Map<string, Set<MessageHandler>>();
        this.currentSubscription = this.messages$_.subscribe(
            message => {
                this.handleMessage(message);
            }
        )

        //this.messageManager.registerService(this.id_, this);
    }

    id(): string {
        return this.id_;
    }

    register() {
        this.messageManager.registerService(this.id_, this);
    }

    unregister() {
        this.messageManager.unregisterService(this.id_);
    }

    /**
     * 发消息
     * @param message 
     */
    postMessage(message: Message) {
        if (message === null) {
            return;
        }
        this.messageSource.next(message);
    }

    
    /**
     * 添加消息处理, 同一个对象不重复添加
     * @param target   消息发送的目标对象
     * @param messageKey 消息id
     * @param handler 消息处理回调
     */
    addMessageHandler(target: any, messageKey: string , handler: Handler ) {
        if (target === null || messageKey === null || handler === null) {
            return;
        }

        const messageHandler = new MessageHandler(target, handler);
        if (! this.messagehandlersMap_.has(messageKey) ) {
            const array = new Set<MessageHandler>();
            this.messagehandlersMap_.set(messageKey, array);
        }

        const set = this.messagehandlersMap_.get(messageKey);
        const array = Array.from(set);
        for (let i = 0; i < array.length; i++) {
            if (array[i].target === target) {
                return;
            }
        }
        set.add(messageHandler);
    }

    /**
     * 移除消息处理
     * @param target 
     * @param messageKey 
     */
    removeMessageHandler(target: any, messageKey: string) {
        if (target === null || messageKey === null) {
            return;
        }

        if (! this.messagehandlersMap_.has(messageKey) ) {
            return;
        }

        const set = this.messagehandlersMap_.get(messageKey);
        const array = Array.from(set);
        for (let i = 0; i < array.length; i++) {
            if (array[i].target === target) {
                set.delete(array[i]);
            }
        }
    }

    protected handleMessage(message: Message) {
        const messageHandlers = this.getMessageHandlers(message);
        if (messageHandlers === null) {
            return;
        }
        const array = Array.from(messageHandlers);
        for (let i = 0; i < array.length; i++) {
            const messageHandler = array[i];
            messageHandler.handler(message.object);
        }
    }

    protected getMessageHandlers(message: Message): Set<MessageHandler> {
        if ( !this.messagehandlersMap_.has(message.id)) {
            return null;
        }
        return this.messagehandlersMap_.get(message.id);
    }
}

@Injectable()
export class TestMessageService extends BaseMessageService {
    constructor(protected messageManager: MessageManagerService ) {
        
        super(messageManager);
        this.id_ = 'test';
        this.register();
        
        //this.messageManager.registerService()
    }
}

export class Message {
    readonly id: string;
    readonly object: any;

    constructor(id: string , object: any) {
        this.id = id;
        this.object = object;
    }
}