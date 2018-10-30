import { Directive, ViewContainerRef, HostListener,ElementRef, Input } from '@angular/core';
/**
 * 属性型指令，用于封装一系列
 */
@Directive({
    selector: `[aimShowTip]`
  })
 export class AimshowtipDirective {
/**
 * @function
 * @param el 
 * @description Directive提供@Directive装饰器功能。
ElementRef注入到指令构造函数中。这样代码就可以访问 DOM 元素了。
Input将数据从绑定表达式传达到指令中。
 */
    constructor(private el: ElementRef) {
        // do nothing for now
        
    }
    @HostListener('mouseleave') onMouseLeave() {
      this.el.nativeElement.lastElementChild.style.display = 'none';       
    }

    @HostListener('mouseenter') onmouseenter() {
      this.el.nativeElement.lastElementChild.style.display = 'block';
    }
    }
