import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';

const AddressUrl = 'mock-data/city.json';
@Injectable()

export class AddressService {
    constructor(public http: Http) {
    }

    public setAll() {
        return this.http.get(AddressUrl)
            .map((response: Response) => {
                const res = response.json();
                return res;
            })
            .catch((error: any) => Observable.throw('Server error' || error));
    }
}

