export class structForDetailData {
    protected provinceValue : string;   /**省名称 */
    protected cityValue : string;   /**城市名称 */
    protected houseDistrictName: string; /**小区名称 */
    protected others: string; /**其它 */
    protected areaValue: string; /**面积 */
    protected layoutName: string; // 户型名称

    constructor() {
        this.provinceValue = "";
        this.cityValue = "";
        this.houseDistrictName = "";
        this.others = "";
        this.areaValue = "";
        this.layoutName = "";
    }

    toSavaParam() {
        
    }
}