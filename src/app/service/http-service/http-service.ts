import {Http, Headers, Response, RequestOptions} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';

import {environment} from '../../../environments/environment';
import {urlPathConsts} from './url-path.const';

export class ServerResponseData {
    public record: any;
}

export class ServerResponseModel {
    public msg: string;
    public code: number;
    public data: ServerResponseData;
}

@Injectable()
export class HttpService {

    private headers: Headers = new Headers({'Content-Type': 'application/json'});
    private targetUrl: string;
    private body: any;

    constructor(private httpModule: Http) {
    }

    login(username: string, password: string) {
        this.targetUrl = environment.urlBase + urlPathConsts.login;
        this.body = {
            username: username,
            password: password
        }

        return undefined;
        // return this.http_post(this.targetUrl, {body: JSON.stringify(this.body), headers: this.headers});
    }

    fetchModel(id: string) {
        return new Observable<ServerResponseModel>();
    }

    refresh() {
        this.targetUrl = environment.urlBase + urlPathConsts.refresh;
        this.body = {
            // refresh: this.user.refreshToken
        }

        return this.httpModule.post(this.targetUrl, ' ', /*, JSON.stringify(this.body),*/ {headers: this.headers})
            .map((response: any) => {
                const data = response.json();
                return data;
            })
    }

    private http_get(url, reqOpts?: any): Observable<ServerResponseModel> {
        // return this.request(url, Object.assign({method: 'get'}, reqOpts));
        return undefined;
    }

    private http_post(url, reqOpts?: any): Observable<ServerResponseModel> {
        // return this.request(url, Object.assign({method: 'post'}, reqOpts));
        return undefined;
    }

    private http_update(url, reqOpts?: RequestOptions): Observable<ServerResponseModel> {
        // return this.request(url, Object.assign({method: 'update'}, reqOpts));
        return undefined;
    }

    private http_delete(url, reqOpts?: RequestOptions): Observable<ServerResponseModel> {
        // return this.request(url, Object.assign({method: 'delete'}, reqOpts));
        return undefined;
    }

    private request(url: string, reqOpts: RequestOptions) {
        // this.showLoading();
        return this.httpModule.request(url, new RequestOptions(reqOpts))
            .map((res: Response) => res.json() || {})
            // this.hideLoading();
            // .map(this.preprocessResponse.bind(this))
            // .catch(this.handleErr.bind(this));
    }

    private preprocessResponse(data) {
        let responseData = <ServerResponseModel> data;
        /*
        if (responseData.code && responseData.code.toString() !== '10000') {
            console.warn('request code error:' + responseData.code);
        }*/
        return data;
    }

    private handleErr(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error ;// || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
