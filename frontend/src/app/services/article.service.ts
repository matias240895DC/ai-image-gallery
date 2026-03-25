import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Global } from './Global';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  public url: string;

  constructor(private _http: HttpClient) {
    this.url = Global.url;
  }

  getArticles(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    const query = `?page=${page}&limit=${limit}&q=${search}`;
    return this._http.get(this.url + `articles${query}`);
  }

  getArticlesByUser(userId: string, page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    const query = `?page=${page}&limit=${limit}&q=${search}`;
    return this._http.get(this.url + `articles/users/${userId}/articles${query}`);
  }

  getArticle(id: string): Observable<any> {
    return this._http.get(this.url + 'articles/' + id);
  }

  search(searchString: string): Observable<any> {
    return this._http.get(this.url + 'articles/search/' + searchString);
  }

  getAiImages(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    const query = `?page=${page}&limit=${limit}&q=${search}`;
    return this._http.get(this.url + `articles/imagenIa/all${query}`);
  }

  getAiImagePoster(filename: string): string {
    return this.url + 'articles/imagenIa/' + filename;
  }

  createArticle(article: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    
    // Si es FormData (tiene imagen), no enviamos Content-Type para que el navegador lo ponga con el boundary
    if (article instanceof FormData) {
      return this._http.post(this.url + 'articles', article, { headers: headers });
    } else {
      let params = JSON.stringify(article);
      let jsonHeaders = headers.set('Content-Type', 'application/json');
      return this._http.post(this.url + 'articles', params, { headers: jsonHeaders });
    }
  }

  generateImage(prompt: string, token: string): Observable<Blob> {
    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);
    return this._http.post(this.url + 'articles/imagenIa', { prompt }, { headers: headers, responseType: 'blob' });
  }

  updateArticle(id: string, article: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    
    if (article instanceof FormData) {
      return this._http.put(this.url + 'articles/' + id, article, { headers: headers });
    } else {
      let params = JSON.stringify(article);
      let jsonHeaders = headers.set('Content-Type', 'application/json');
      return this._http.put(this.url + 'articles/' + id, params, { headers: jsonHeaders });
    }
  }

  deleteArticle(id: string, token: string): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this._http.delete(this.url + 'articles/' + id, { headers: headers });
  }
}
