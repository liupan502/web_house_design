export class BaseAction {

    nextAction: BaseAction;

    previousAction: BaseAction;

    mgr_: BaseActionManager;

    constructor() {
        this.nextAction = null;
        this.previousAction = null;
        this.mgr_ = null;
    }

    setMgr(mgr: BaseActionManager) {
        if (this.mgr_ === mgr) {
            return;
        }
        this.mgr_ = mgr;
        // this.mgr_.add(this);
    }

    excute(): boolean {
        return false;
    }

    cancel(): boolean {
        return false;
    }
}

export class BaseAddAction extends BaseAction {

    protected objects_: Array<any>;
    constructor(objects: Array<any>) {
        super();
        this.objects_ = objects;
    }
}

export class BaseDeleteAction extends BaseAction {

    protected objects_: Array<any>;
    constructor(objects: Array<any>) {
        super();
        this.objects_ = objects;
    }
}

export class BaseModifyAction extends BaseAction {

    protected previousObjects_: Array<any>;

    protected currentObjects_: Array<any>;
    constructor(previousObjects: Array<any> , currentObjects: Array<any>) {
        super();
        this.previousObjects_ = previousObjects;
        this.currentObjects_ = currentObjects;
    }
}

export class BaseActionManager {
    protected currentAction_: BaseAction
    constructor() {
       // this.currentAction_ = null;
       this.currentAction_ = new BaseAction();
    }

     add(action: BaseAction) {
        if (action === null) {
            return;
        }

        // if (this.currentAction_ !== null) {
        //     const tmpNextAction = this.currentAction_.nextAction;
        //     if (tmpNextAction !== null) {
        //         tmpNextAction.previousAction = null;
        //     }
        //     action.previousAction = this.currentAction_;
        //     this.currentAction_.nextAction =  action;

        // } 

        // action.previousAction = this.currentAction_;        
        // action.setMgr(this);
        // this.currentAction_ = action;
        // this.currentAction_.excute();

        const tmpNextAction = this.currentAction_.nextAction;
        if (tmpNextAction !== null) {
            tmpNextAction.previousAction = null;
        }

        action.previousAction = this.currentAction_;
        this.currentAction_.nextAction = action;

        action.setMgr(this);
        this.currentAction_ = action;
        this.currentAction_.excute();
    }

    /**
     * 执行完本次操作后，如果仍可执行该操作，返回true, 
     * 反之返回false
     */
    redo(): boolean {
        // 异常情况判断
        if (this.currentAction_ === null) {
            return false;
        }

        const nextAction = this.currentAction_.nextAction;
        if (nextAction === null) {
            return false;
        }

        nextAction.excute();
        this.currentAction_ = nextAction;

        return this.currentAction_.nextAction === null ? false : true;
    }

    /**
     * 执行完本次操作后，如果仍可执行该操作，返回true, 
     * 反之返回false
     */
    undo(): boolean {
        // 异常情况判断
        if (this.currentAction_ === null) {
            return false;
        }

        const prevAction = this.currentAction_.previousAction;
        
        // 一旦prev为null，则说明回到了头节点，此时无法再undo 
        if (null === prevAction) {
            return false;
        }

        this.currentAction_.cancel();
        this.currentAction_ = prevAction;
        
        return (this.currentAction_.previousAction !== null);
    }

    hasNext(): boolean {
         if (this.currentAction_ === null) {
             return false;
         }

        const nextAction = this.currentAction_.nextAction;
        if (nextAction === null) {
            return false;
        }

        return true;
    }

    hasPrev(): boolean {
        if (this.currentAction_ === null) {
            return false;
        }

        const prevAction = this.currentAction_.previousAction;
        if (prevAction === null) {
            return false;
        }

        return true;
    }

    /**
     * 清空所有的action，
     * 将每个action的关联action设置为null,避免内存泄漏
     */
    releaseActions() {

        // 当前链表为空
        if (this.currentAction_  === null) {
            return;
        }

        // 遍历链表，删除链表中的每个动作结点        
        let currentAction = this.currentAction_;
        while (true) {
            const previousAction = currentAction.previousAction;
            currentAction.previousAction = null;
            currentAction.nextAction = null;

            // 如果前置动作为null，说明已经到达链表的尾部， 链表删除完成，
            // 调出循环
            if (previousAction === null) {
                break;
            }

            currentAction = previousAction;
        }
    }
 }
