import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AggregationStatus } from '../aggregation-status';
import { AggregationService } from '../aggregation.service';

@Component({
  selector: 'app-health-monitor',
  templateUrl: './health-monitor.component.html',
  styleUrls: ['./health-monitor.component.css']
})
export class HealthMonitorComponent implements OnInit {

  constructor(private aggregationService: AggregationService) { }

  loading = true;
  hasError = false;
  // tslint:disable-next-line: variable-name
  private _aggregationStatus: AggregationStatus;
  get aggregationStatus() { return this._aggregationStatus; }

  set aggregationStatus(value: AggregationStatus) {
    this._aggregationStatus = value;
    this.aggregationStatusChanged.emit(value);
  }
  @Output() aggregationStatusChanged = new EventEmitter<AggregationStatus>();

  ngOnInit() {
    // Aggregation Service Polling
    setInterval(() => {
      this.loading = true;
      this.aggregationService.getStatus().subscribe(
        s => {
          this.loading = false;
          this.hasError = false;
          this.aggregationStatus = s;
        },
        e => {
          this.loading = false;
          this.hasError = true;
          this.aggregationStatus = new AggregationStatus();
        });
    }, 3000);
  }

}
