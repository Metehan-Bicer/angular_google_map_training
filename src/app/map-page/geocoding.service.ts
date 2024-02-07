import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  private apiKey = 'AIzaSyCxuSRcEIhUxERd9dQeAE-Axqx_xWjEi5g';
  private apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor(private http: HttpClient) { }

  getLocation(address: string): Observable<any> {
    const url = `${this.apiUrl}?address=${address}&key=${this.apiKey}`;
    return this.http.get(url);
  }
}