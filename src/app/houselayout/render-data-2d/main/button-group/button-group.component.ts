import { Component, ChangeDetectorRef, OnInit, Output, EventEmitter } from '@angular/core';
import { DrawHouseLayoutService, TestMessageService, Message, MessageManagerService } from '../../../service/hsservice';
import { HttpClient } from '@angular/common/http';
import { urlPathConsts } from './../../../../service/http-service/url-path.const';
import { environment } from './../../../../../environments/environment';
import { uuid } from '../../../../math/math';
import { DesignService, AppService } from './../../../../service/service.service';
import { Design } from '../../../../houselayout/entity/entity';
import { from } from 'rxjs/observable/from';

@Component({
    selector: 'app-button-group',
    templateUrl: './button-group.component.html',
    styleUrls: ['./button-group.component.css']
})
export class ButtonGroupComponent implements OnInit {
    @Output() btGroupgenerateOuterWall = new EventEmitter();
    workFlowStatus: boolean[];
    public id: string;
    public isloadDrop: boolean = false;
    public lastSavedId: string = "";

    public btnGroup: Array<any>;
    public selectedBtn: string;
    constructor(private drawHouseLayoutService: DrawHouseLayoutService,
        private testService: TestMessageService,
        private msgManager: MessageManagerService,
        private cdRef: ChangeDetectorRef,
        private http: HttpClient,
        private designService: DesignService,
        
        private appServie: AppService
    ) {

        this.workFlowStatus = [false, false];

        this.msgManager.addMessageHandler(this, DrawHouseLayoutService.id, DrawHouseLayoutService.STEP_STATUSS, this.processActionFlow());
        // 控制撤销恢复按钮的激活状态
        this.msgManager.addMessageHandler(this, 'drawHouseLayout', 'stepButtonStatus', this.stepButtonStatus());
        
    }

    ngOnInit() {
        this.btnGroup = [
            {
                'name': '生成外墙',
                'iconImg': 'assets/img/houselayout/tool/inwall.png'
            },

            {
                'name': '拆除外墙',
                'iconImg': 'assets/img/houselayout/tool/outwall.png'
            }
        ]
    }



    //生成外墙
    onSelectBtn(btn): void {
        // this.selectedBtn = btn; 
        console.log('[button-group.component.ts]onSelectBtn', btn);
        const oNav = document.getElementById('nav');
        const aLi = oNav.getElementsByTagName('li');
        if (btn.name === '生成外墙') {
            this.btGroupgenerateOuterWall.next(true);
            for (let i = 1; i < aLi.length; i++) {
                aLi[i].className = '';
            }
            aLi[0].className = 'disabled';
        } else {
            this.btGroupgenerateOuterWall.next(false);
            for (let i = 1; i < aLi.length; i++) {
                aLi[i].className = 'disabled';
            }
            aLi[0].className = '';
        }
    }


    isNextPrev(index: number) {
        return this.workFlowStatus[index];
    }

    //接收消息 改变按钮激活状态
    stepButtonStatus(): (object: any) => void {
        return (object: any) => {
            const id = object.id;
            const result = object.result;
            this.workFlowStatus[0] = result[0];
            this.workFlowStatus[1] = result[1];
        }
    }

    //撤销
    clickPreStep() {
        const obj = {} as any;
        const message = new Message(DrawHouseLayoutService.UNDO, obj);
        this.drawHouseLayoutService.postMessage(message);

        // 清空选择
        const objinfo = new Array<any>();
        objinfo.push('none');
        const message1 = new Message('clearSelect', objinfo);
        this.drawHouseLayoutService.postMessage(message1);
    }

    //恢复
    clickNextStep() {
        const obj = {} as any;
        const message = new Message(DrawHouseLayoutService.REDO, obj);
        this.drawHouseLayoutService.postMessage(message);

        // 清空选择
        const objinfo = new Array<any>();
        objinfo.push('none');
        const message1 = new Message('clearSelect', objinfo);
        this.drawHouseLayoutService.postMessage(message1);
    }

    //撤销/恢复

    /* const obj = {} as any;
     obj.id = Math.random().toString();
     obj.preEnabled = null;
     obj.nextEnabled = false;
     wallgenerating(): (object: any) => void {
     return(object: any) => {*/
    processActionFlow(): (obj: any) => void {
        return (obj: any) => {
            if (obj.preEnabled !== undefined && obj.preEnabled !== null) {
                this.workFlowStatus[0] = <boolean>(obj.preEnabled);
            }

            if (obj.nextEnabled !== undefined && obj.nextEnabled !== null) {
                this.workFlowStatus[1] = <boolean>(obj.nextEnabled);
            }
            this.cdRef.detectChanges();
        }
    }

    save() {
        const walls = this.designService.getHouseLayout().wallEntities();
        const entityInfos = walls.dumpWallEntities();

        const rooms = this.designService.getHouseLayout().roomEntities();
        const roomInfos = rooms.dumpRoomInfos();

        // this.faimSvc.updateHouselayout(entityInfos, roomInfos);

        this.appServie.saveDeign();
        this.saveHouselayout();

    }

    saveHouselayout() {
        const designinfo = this.designService.getDesign();
        const jsonresult = designinfo.toJSON();

        const firstSave = (DesignService.houselayout_no === 'empty');
        const uuidVal = (firstSave) ? uuid() : DesignService.houselayout_no;
        const canvasView = document.getElementById('myCanvas');
        let canvasContext = null;
        if (canvasView) {
            canvasContext = (<HTMLCanvasElement>canvasView).toDataURL();
        }

        const dataHouselayout: FormData = new FormData();
        dataHouselayout.append('no', uuidVal);
        dataHouselayout.append('data', JSON.stringify(jsonresult));
        dataHouselayout.append('photo2d', canvasContext);

        const pathnew = environment.urlBase + urlPathConsts.saveDesign;
        this.http.post(environment.urlBase + urlPathConsts.saveDesign, dataHouselayout).subscribe((res: any) => {
            if (firstSave) {
                DesignService.houselayout_no = res.data.no;
                this.openSaveDetailPlane(res.data.no);
            }
        }, (err: any) => {
            console.log('[button-group.component.ts]save');
            console.log('An error occurred:', err.error.no);
            console.log(dataHouselayout);
        })
    }

    openSaveDetailPlane(no?: string) {
        const info = new Array();
        info.push('DetailEdit');
        if (no) {
            info.push(no);
        }
        const message = new Message(DrawHouseLayoutService.OPEN_POP_PLANE, info);
        this.drawHouseLayoutService.postMessage(message);
    }

    openMyHouselayout() {
        this.isloadDrop = false;
        const info = new Array();
        info.push('MyHouseLayout');
        const message = new Message(DrawHouseLayoutService.OPEN_POP_PLANE, info);
        this.drawHouseLayoutService.postMessage(message);
    }


    openSearchHouselayout() {
        this.isloadDrop = false;
        const info = new Array();
        info.push('SearchHouselayout');
        const message = new Message(DrawHouseLayoutService.OPEN_POP_PLANE, info);
        this.drawHouseLayoutService.postMessage(message);
    }


    // openSearchHouselayout() {
    //     this.isloadDrop = false;
    //     const info = new Array();
    //     info.push('SearchHouselayout');
    //     const message = new Message(DrawHouseLayoutService.OPEN_POP_PLANE, info);
    //     this.drawHouseLayoutService.postMessage(message);
    // }

}
