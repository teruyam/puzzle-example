import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BoardComponent } from './board/board.component';
import { HttpClientModule } from '@angular/common/http';
import { HealthMonitorComponent } from './health-monitor/health-monitor.component';
import { RankingListComponent } from './ranking-list/ranking-list.component';
import { StatusIndicatorComponent } from './status-indicator/status-indicator.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    HealthMonitorComponent,
    RankingListComponent,
    StatusIndicatorComponent
  ],
  imports: [
    BrowserModule,
    ClarityModule,
    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
