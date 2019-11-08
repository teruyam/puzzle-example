import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AggregationService {

  constructor() { }
  AGGREGATION_STATUS = {
    licenseStatus: { enabled: true },
    userEntries: [
      { id: 1, name: 'Corp1', score: 50 },
      { id: 2, name: 'Corp2', score: 80 },
    ]
  };

  getStatus(): Observable<AggregationStatus> {
    return of(this.AGGREGATION_STATUS);
  }
}

export class AggregationStatus {
  licenseStatus: LicenseStatus;
  userEntries: UserEntry[];
}

export class LicenseStatus {
  enabled: boolean;
}

export class UserEntry {
  id: number;
  name: string;
  score: number;
}
