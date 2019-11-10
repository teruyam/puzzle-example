import { Component } from '@angular/core';
import { AggregationStatus } from './aggregation-status';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'vmware-puzzle';

  licensed = true;

  aggregationStatusChanged(value: AggregationStatus) {
    this.licensed = value && value.licenseStatus && value.licenseStatus.enabled;
  }

}
