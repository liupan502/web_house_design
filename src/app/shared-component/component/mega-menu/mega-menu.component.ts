import { Component, ElementRef, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { MenuItem, DomHandler } from './../../common/api';

@Component({
    selector: 'app-mega-menu',
    templateUrl: 'mega-menu.component.html',
    providers: [DomHandler],
    styleUrls: ['./mega-menu.component.css']
})
export class MegaMenuComponent implements OnInit {

    @Input() model: MenuItem[];

    @Input() style: any;

    @Input() styleClass: string;

    @Input() orientation: string = 'horizontal';

    @Input() activeId: string;

    @Output() targetInfo: EventEmitter<any> = new EventEmitter();

    activeItem: any;

    activeCategoryId: string;

    constructor(public el: ElementRef, public domHandler: DomHandler) {
    }

    ngOnInit() {
        this.activeCategoryId = this.activeId;
    }

    onItemMouseEnter(event, item, menuitem: MenuItem) {
        if (menuitem.disabled) {
            return;
        }

        this.activeItem = item;
        let submenu = item.children[0].nextElementSibling;
        if (submenu) {
            submenu.style.zIndex = ++DomHandler.zindex;
            if (this.orientation === 'horizontal') {
                submenu.style.top = this.domHandler.getOuterHeight(item.children[0]) + 'px';
                submenu.style.left = '0px';
            } else if (this.orientation === 'vertical') {
                let wrapHeight, top, clientHeight, maxTop, maxBottom;
                wrapHeight = document.getElementsByClassName('mega-menu-box')[0].clientHeight;
                top = - submenu.offsetHeight / 2 + 33;
                clientHeight = document.body.clientHeight - 30;
                maxBottom = clientHeight / 2 - wrapHeight / 2 + wrapHeight - item.offsetTop - submenu.offsetHeight / 2;
                maxTop = clientHeight / 2 - wrapHeight / 2 + item.offsetTop - submenu.offsetHeight / 2;
                top = maxTop < 0 ? top - maxTop - 32 : top;
                top = maxBottom < 0 ? top + maxBottom - 35 : top;

                submenu.style.top = top + 'px';
                submenu.style.left = this.domHandler.getOuterWidth(item.children[0]) - 4 + 'px';
            }
        }
    }

    onItemMouseLeave(event, link) {
        this.activeItem = null;
    }

    itemClick(event, item: MenuItem, categoryId) {
        event.stopPropagation();
        if (item.disabled) {
            event.preventDefault();
            return;
        }

        if (!item.url) {
            event.preventDefault();
        }

        if (item.command) {
            item.command({
                originalEvent: event,
                item: item
            });
        }

        this.activeCategoryId = categoryId || this.activeCategoryId;
        this.targetInfo.emit(item);
        this.activeItem = null;
    }

}
