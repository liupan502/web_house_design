import { Path, Matrix, Point as PaperPoint ,Item, Color, Style, Group} from 'paper'
import {BasePath, PathDrawType, BasePathFactory} from '../path/path'
import {BaseEntity, Design, Serializable , IShowBaseType} from '../houselayout/entity/entity'
export enum GeometryType {
    GEO_NONE = 0,
    GEO_LINE = 1,
    GEO_ARC = 2,
    GEO_POLYGON = 3,
    GEO_POINT = 4,
    GEO_CIRCLE = 5,
    GEO_RECT = 6,
    GEO_EILLPSE = 7,
    GEO_POINTTEXT = 8,
}






export  class BaseGeometry implements Serializable<BaseGeometry> {
    protected type_: GeometryType; 
    protected isNull_: boolean;
    

    constructor() {
        this.isNull_ = true;
        this.type_ = GeometryType.GEO_NONE;
        
       
    }
    
    transformvalue(prpinfo: any) {
       // 将Map和set属性改装为 Array，并调用
       if ( prpinfo instanceof Set || prpinfo instanceof Array) {
        const arrayinfo = Array.from(prpinfo);
        const rinfo = new Array<Object>();
       for (let i = 0; i < arrayinfo.length; i++) {

           // 判断对象是否为实体
           if (arrayinfo[i] instanceof BaseEntity || arrayinfo[i] instanceof BaseGeometry) {
               const objinfo =  arrayinfo[i].serialize();
               rinfo.push(objinfo);
           } else if (arrayinfo[i] instanceof Map || arrayinfo[i] instanceof Set || arrayinfo[i] instanceof Array) {
               return this.transformvalue(arrayinfo[i]);

           } else {
               rinfo.push(arrayinfo[i]);
           }
       }

       return rinfo;

   } else if (prpinfo instanceof Map) {
       const arrayinfo = new Object();
       const rinfo = new Array<string>();
       const arrays = new Array<Object>();

       for (const key in prpinfo) {
           if (key  !== null) {
               // const geo: BaseGeometry = this.geos_[key];
               const tmpkey = <string>(key);
               const objinfo = prpinfo[key];
               rinfo.push(tmpkey);
               arrays.push(objinfo);
           }
       }
       arrayinfo['keyname'] = rinfo;
       arrayinfo['value'] = arrays;

   } else if (prpinfo instanceof BaseGeometry) {
       return prpinfo.serialize();
   } else {
       return prpinfo;
   }
}

    injectinfo() {

    }

    // Begin: Added by fangchen 0904， 基类定义序列化方法
    // 只有子类中存在耦合的属性需要解耦时，才在此基础上重载此函数
    // 相互耦合中的对象间，对其中一个进行解耦操作即可
    // 解耦时 可以从自身循环引用的对象中提取真正有用的属性 组成一个小包
    // 例如 A.B  B.A  但对B来说，知道A的索引号和其他关键信息即可，
    serialize() {
        const newobj = new Object();
        for (const i in this) {
            if (this.hasOwnProperty(i)) {
                const str = i.toString();
                newobj[str] = this.transformvalue(this[i]);
            }
        }

        return newobj;
    }

    deserialize(input) {
        this.type_ = input.type_;
        this.isNull = input.isNull_;        
        return this;
    }

    clone(): any {
        return null;
    }

    isNull(): boolean {
        return this.isNull_;
    }

    type(): GeometryType {
        return this.type_;
    }  

    // Begin: Added by fangchen 20170828
    // 为了能获得贴墙图形和墙的边界交点
    isAttachToLine(line: Path.Line): Array<PaperPoint> {
         /**根据数据创建一个透明的path用于计算 */
         const arraynow = new Array<PaperPoint>();
         const  calcTransparentPath = BasePathFactory.CreatePath(this);
         calcTransparentPath.opacity = 0;
         if(null === calcTransparentPath) {
             console.error('bad error');
             return;
         }

         for(let i = 0; i < calcTransparentPath.curves.length; i++) {
             const p1 = calcTransparentPath.curves[i].point1;
             const p2 = calcTransparentPath.curves[i].point2;

             // 利用距离判断是否贴合
             const p1near = line.getNearestPoint(p1);
             const p2near = line.getNearestPoint(p2);
             const p1neardis = p1.getDistance(p1near);
             const p2neardis = p2.getDistance(p2near);
             if (p1neardis < 1e-3 && p2neardis < 1e-3) {
                arraynow.push(p1);
                arraynow.push(p2);
                
                 /**销毁透明path */
                 calcTransparentPath.removeSegments();
                return arraynow;                
            }
         }

         /**销毁透明path */
         calcTransparentPath.removeSegments();
         return null;
    }
    // End: 

    /**
     * 生成geometry的凸点集合，用于进行计算
     * 这些信息足够绝大多数 几何判断
     */
    generateOuterPoints(): Array<PaperPoint> {
         return null;
    }

    

   

    getViewBox(): Array<any> {
        const parray = new Array<any>();
        /*if (this.path_ !== null) {
            const r1 = {} as any;
            r1.x = this.path_.bounds.topLeft.x;
            r1.y = this.path_.bounds.topLeft.y;
            const r2 = {} as any;
            r2.x = this.path_.bounds.bottomRight.x;
            r2.y = this.path_.bounds.bottomRight.y;
            
            
            parray.push(r1);
            parray.push(r2);            
        }*/
        
        return parray;
    }      

    

    

}
