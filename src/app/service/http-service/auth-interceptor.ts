import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';

import {Observable} from 'rxjs/Rx';
import {HttpService} from './http-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    promise: Promise<string>;

    constructor( private http: HttpService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authHeader;
        /*
        if (!this.user.accessToken) {
            return this.http.refresh().flatMap((data: any) => {
                if ( data && data.access && data.refresh ) {
                    this.user.tokenRefresh(data.access, data.refresh);
                    authHeader = 'Bearer ' + data.access;
                    const refreshRequest = req.clone({headers: req.headers.set('Authorization', authHeader)});
                    return next.handle(refreshRequest).catch((res: HttpResponse<any>) => {
                        return Observable.throw(res);
                    });
                }
            });
        } else {
            authHeader = 'Bearer ' + this.user.accessToken;

            const authRequest = req.clone({headers: req.headers.set('Authorization', authHeader)});
            
            // console.log(authRequest);
            return next
                .handle(authRequest)
                .catch((res: HttpResponse<any>) => {
                    switch (res.status) {
                        case 401:
                            console.log('access_token过期，刷新ing', '错误代码为：401');
                            return this.http.refresh().flatMap((data: any) => {
                                if ( data && data.access && data.refresh ) {
                                    this.user.tokenRefresh(data.access, data.refresh);
                                    const refreshHeader = 'Bearer ' + data.access;
                                    const refreshRequest = req.clone({headers: req.headers.set('Authorization', refreshHeader)});
                                    return next.handle(refreshRequest);
                                } else {
                                    console.error('token刷新失败');
                                }
                            })
                        case 404:
                            console.log('API不存在', '错误代码为：404');
                            break;
                        default:
                            console.log('错误代码为：' + res.status)
                    }
                    return Observable.throw(res);
                })
        }

    }
    */
    return Observable.throw(0);
    }
}
