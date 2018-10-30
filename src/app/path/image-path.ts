import { Path, Raster, Size, Style, Matrix, CompoundPath, Group, view, Point as PaperPoint, PathItem , Item} from 'paper';
import { BasePath } from './base-path';
import { BaseGeometry } from '../geometry/base';
import { PolygonPath } from './polygon-path';
import * as MathUtil from '../math/math';
import { Polygon } from '../geometry/polygon';
import { Point } from '../geometry/point';
import { BasePathFactory } from './path-factory';


/**
 * �ṩ��ͼƬsource���ֱ��ʵĶ�ȡ��������ʽ��Style�����Ժ�BasePathһ�������ṩ����֤�ṩ����ͼƬ��Style
 *
 * @export
 * @class ImagePath
 * @extends {PolygonPath}
 * @desc  �̳�PolygonPathʹ��ImagePath�߱����������߶��ͼԪͼƬ��Ⱦ������
 */
export class ImagePath extends BasePath {
  style: Style;
  protected raster_: Raster;
  protected source_: string|HTMLCanvasElement|HTMLImageElement;
  protected tmpGeos_: Array<BaseGeometry>;
  protected segpath_: Array<BasePath>;
  protected rasterpathgroup_: Group;
  protected outline_: Item ;
  protected oripos_: PaperPoint;
  //TEMP !! ENTITY WILL TAKE CARE OF ITSELF
  protected entityLayer_: Group;
  //TEMP !!

  // ����ͼƬʱ�������ּ���������
  /**
   * Creates an instance of ImagePath.
   * src must be specified (Image will not be rendered until UpdatePath is called)
   * there could be multiple geos specified for one image
   * @param {Array<BasePath>} geos
   * @param {string} src
   * @memberof ImagePath
   * @more updating, change BasePath to baseGeo
   */
  constructor(geos: Array<BaseGeometry>, src: string|HTMLCanvasElement|HTMLImageElement, width?: number, length?: number) {
      super();


      // ����ͼ��
      this.source_ = src;
      this.outline_ = null;
      // �����з��飬��������û�л��ƻ��߱�remove��ʱ��ͼƬҲ���ᱻ��Ⱦ
      this.raster_ = new Raster(src);
      if(width) {
        this.raster_.width = width;
      } 
      if(length) {
         this.raster_.height = length;
      }
      this.tmpGeos_ = geos;
      this.segpath_ = new Array<BasePath>();
      this.rasterpathgroup_ = null;


      // TEMP!!
      this.entityLayer_ = null;
      // TEMP!!

      // this.gearup();
      this.getPathFromGeo();
      this.gearup();
      // �ض���style�� ������ܹ�����ͼƬ����ʽ��Ϣ
      // this.style = this.raster_.style;
      if (this.outline_ !== null) {
        this.outline_.opacity = 1;

      }

      // 2. �����µ�ʵ����Ϣ��������


      // 3. ����
      if (this.rasterpathgroup_  === null) {
          this.rasterpathgroup_ = new Group([this.outline_, this.raster_]);
      } else {
      }

      this.rasterpathgroup_.clipped = true;
      //this.rasterpathgroup_.moveBelow(this.entityLayer_);
  }

  /**
   *
   */
  protected getPathFromGeo() {
    // 1. remove ori path
      while (this.segpath_.length > 0) {
          const poppath = this.segpath_.pop();
          poppath.removeSegments();
      }

    // 2. update path from geo
    for (let i = 0; i < this.tmpGeos_.length; i++) {
         const pathinfo = BasePathFactory.CreatePath(this.tmpGeos_[i]);
         pathinfo.strokeColor = 'white';
         pathinfo.update();
         this.segpath_.push(pathinfo);
    }

  }

  protected gearup() {
    if(this.outline_ === null ){
       this.outline_ = new CompoundPath({opacity: 1});
    } else {
       // 不能直接更新图像
       this.outline_.removeChildren();
    }

    if(this.entityLayer_ === null) {
    this.entityLayer_ = new Group();

    for (let i = 0; i < this.segpath_.length; i++) {
        this.entityLayer_.addChild(this.segpath_[i]);
        
    }


  }

   // 2. ���Ƴ�������
   //this.outline_ = this.segpath_[0].unite(this.segpath_[0]);
   for (let i = 0; i < this.segpath_.length; i++) {
     this.outline_.addChild(this.segpath_[i]);

   }

     this.oripos_ = this.outline_.position;
     //this.oripos_.y = -28.5;
  }

  /**
   * alter source of the image
   * @param {string} imgPath_
   * @memberof ImagePath
   */
  alterSrc(imgPath_: string) {
      this.raster_.source = imgPath_;
  }

  /**
   * get ppi of the image
   *
   * @memberof ImagePath
   */
  getResolution(): Size {
      if (this.raster_) {
        return this.raster_.resolution;
      } else {
        return null;
      }
  }

  /**
   *set ppi of image
   *
   * @memberof ImagePath
   */
  setResolution(resolution: Array<number>): boolean{
      if (this.raster_) {
         // this.raster_.resolution = new Size(resolution);
         return true;
      } else {
        return true;
      }

  }

   /**df
    * transformʱ��Ҫ����������ͼƬһ����ת
    *
    * @param {Matrix} matrix
    * @memberof ImagePath=
    */
   transform(matrix: Matrix) {
       if (this.rasterpathgroup_) {

      this.rasterpathgroup_.applyMatrix = false;
      if(matrix.rotation === this.rasterpathgroup_.rotation) {
        if(matrix.tx === this.rasterpathgroup_.position.x && matrix.ty === this.rasterpathgroup_.position.y) {
          // 啥也不干
          this.rasterpathgroup_.clipped = true;
          this.rasterpathgroup_.moveBelow(this.entityLayer_);
          return;
        }

      }
        this.rasterpathgroup_.position = this.oripos_;
        this.rasterpathgroup_.rotation = 0;
        this.entityLayer_.position = this.oripos_;
         this.entityLayer_.rotation = 0;

       this.rasterpathgroup_.transform(matrix);
       this.entityLayer_.transform(matrix);
       this.rasterpathgroup_.clipped = true;
       this.rasterpathgroup_.moveBelow(this.entityLayer_);
       this.entityLayer_.sendToBack();
      this.rasterpathgroup_.sendToBack();

       }
   }

   setWidth(width: number) {
      this.raster_.width  = width;
   }

   setLength(length: number) {
     this.raster_.height = length;
   }

   drawTest() {

    this.segpath_[0].update();
    this.entityLayer_.addChild(this.segpath_[0]);
    this.segpath_[0].translate(new PaperPoint(500,500));
    //polystart = this.segpath_[0];
     for (let i = 0; i < this.segpath_.length; i++) {

      ///polystart = polystart.unite(this.segpath_[i]);
     }

   }

   remove(): boolean {
    while (this.segpath_.length > 0) {
      const poppath = this.segpath_.pop();
      poppath.removeSegments();
  }
       this.outline_.remove();
       this.raster_.remove();
       return true;
   }

   /**
    * render
    */
   update() {
      // 1. update 不执行任何操作

   }
}
