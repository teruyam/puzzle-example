import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AggregationStatus } from './aggregation-status';

@Injectable({
  providedIn: 'root'
})
export class AggregationService {

  private url = '/api/AggregationStatus';
  AGGREGATION_STATUS = {
    licenseStatus: { enabled: true },
    userEntries: [
      { id: 1, name: 'Corp1', score: 50 },
      { id: 2, name: 'Corp2', score: 80 },
    ]
  };

  constructor(private http: HttpClient) { }

  getStatus(): Observable<AggregationStatus> {
    return this.http.get<AggregationStatus>(this.url);
  }
}
