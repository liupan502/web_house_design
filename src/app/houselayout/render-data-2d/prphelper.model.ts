import { Type } from '@angular/core';

export class PropertyPanelHelper {
    constructor(
        public typespecter: Type<any>,
        public typename: string,
        public id:  string
    ) {
        
    }
}