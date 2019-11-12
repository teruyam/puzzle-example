import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserEntry } from './user-entry';

@Injectable({
  providedIn: 'root'
})
export class UserEntryService {

  private url = '/api/UserEntry';
  constructor(private http: HttpClient) { }

  getUserEntries(): Observable<UserEntry[]> {
    return this.http.get<UserEntry[]>(this.url);
  }

  postUserEntry(userEntry: UserEntry): Observable<UserEntry> {
    return this.http.post<UserEntry>(this.url, userEntry);
  }
}
