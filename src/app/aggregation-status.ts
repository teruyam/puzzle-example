import { LicenseStatus } from './license-status';
import { UserEntry } from './user-entry';

export class AggregationStatus {
  licenseStatus: LicenseStatus;
  userEntries: UserEntry[];
}
