/** 
 * creator ： fangchen、yuanlu,tangxileng
 * create date: 2017.09.18
*/
import {Directive, Input, OnChanges, SimpleChanges} from '@angular/core'
import {AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators} from '@angular/forms'
import {PropertyComponet, PropertyPanel, PropertyCompares, PropertyRange} from '../property.component';

/**
 * 规定输入的字符必须满足特定的规范（用正则表达式表示)
 */
export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
        const allowed = nameRe.test(control.value);
        return allowed ? null : {'forbiddenName': {value: control.value}};
    };
}

export function allowedRangeIndexValidator(rangeSepector: PropertyRange) {
    return (control: AbstractControl): {[key: string]: any} => {
        const proerty = new PropertyRange(rangeSepector);
        const allowed = proerty.checkinfos(control.value);
        return allowed ? null : {'allowedRangeIndex': {value: control.value}};
    };
}



/**
 * 在使用模板驱动（即当前场景)时，需要使用directive来引入自定义验证器
 */

@Directive({
    selector: '[forbiddenName]',
    providers: [{provide: NG_VALIDATORS, useExisting: ForbiddenValidatorDirective, multi: true}]
  })
//   @Directive({
//     selector: '[twodecimalDigitmost]',
//     providers: [{provide: NG_VALIDATORS, useExisting: ForbiddenValidatorDirective, multi: true}]
//   })

  export class ForbiddenValidatorDirective implements Validator {
    @Input() forbiddenName: string;
   
    validate(control: AbstractControl): {[key: string]: any} {
      
      return this.forbiddenName ? forbiddenNameValidator(new RegExp(this.forbiddenName, 'i'))(control)
                                : null;
    }
  }

  @Directive({
    selector: '[allowedRangeIndex]',
    providers: [{provide: NG_VALIDATORS, useExisting: AllowValidatorDirective, multi: true}]  
  })

  export class AllowValidatorDirective implements Validator {
      @Input() allowedRangeIndex: string;

      validate(control: AbstractControl):  {[key: string]: any} {
        
        const thisRange = <PropertyRange>(JSON.parse(this.allowedRangeIndex))
        return (this.allowedRangeIndex ) ? allowedRangeIndexValidator(thisRange)(control)
                                  : null;
      }
  }


  