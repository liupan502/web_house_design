import {BaseMessageService} from './message.service'
import {Injectable} from '@angular/core'


type Handler = (object: any) => void;

@Injectable()
export class MessageManagerService {
    protected messageServices_: Map<string, BaseMessageService>;

    /**
     * string: service key
     * array[0] : target
     * array[1] : message key
     * array[2] : callback method
     */
    protected tmpMessageHandlers_: Map<string, Array<any>>;
    // protected 
    constructor() {
        this.messageServices_ = new Map<string, BaseMessageService>();
        this.tmpMessageHandlers_ = new Map<string, Array<any>>();
    }

    /**
     * 注册消息服务，服务不能重复注册
     * 注册失败可能的原因是 无效key值，无效服务
     * @param serviceKey 
     * @param service 
     */
    registerService(serviceKey: string, service: BaseMessageService): boolean {
        if (serviceKey === null || serviceKey.length === 0 || service === null) {
            return false;
        }

        if (this.messageServices_.has(serviceKey)) {
            return false;
        }

        // 添加已存在的消息处理
        if (this.tmpMessageHandlers_.has(serviceKey)) {
            const array = this.tmpMessageHandlers_.get(serviceKey);
            for (let i = 0; i < array.length / 3; i++) {
                service.addMessageHandler(array[i * 3], <string>array[i * 3 + 1], <Handler>array[i * 3 + 2]);
            }
            this.tmpMessageHandlers_.delete(serviceKey);
        }
        this.messageServices_.set(serviceKey, service);
        return true;
    }

    /**
     * 注销消息服务
     * @param serviceKey 
     */
    unregisterService(serviceKey): boolean {
        if (serviceKey === null || serviceKey.length === 0) {
            return false
        }

        if ( !this.messageServices_.has(serviceKey)) {
            return false;
        }

        this.messageServices_.delete(serviceKey);
        return true;
    }

    addMessageHandler(target: any, serviceKey: string, messageKey: string, handler: Handler) {
        if (target === null || serviceKey === null || messageKey === null || handler === null) {
            return;
        }

        if ( !this.messageServices_.has(serviceKey)) {
            if (!this.tmpMessageHandlers_.has(serviceKey)) {
                this.tmpMessageHandlers_.set(serviceKey, new Array<any>());
            }
            const array = this.tmpMessageHandlers_.get(serviceKey);
            array.push(target);
            array.push(messageKey);
            array.push(handler);
            return;
        }

        const messageService = this.messageServices_.get(serviceKey);
        messageService.addMessageHandler(target, messageKey, handler);
    }

    removeMessageHandler(target: any, serviceKey: string, messageKey: string) {
        if (target === null || serviceKey === null || messageKey === null) {
            return;
        }

        if ( !this.messageServices_.has(serviceKey)) {
            return;
        }

        const messageService = this.messageServices_.get(serviceKey);
        messageService.removeMessageHandler(target, messageKey);
    }
}

