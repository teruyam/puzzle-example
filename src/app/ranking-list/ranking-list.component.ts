import { Component, OnInit, Input } from '@angular/core';
import { UserEntry } from '../user-entry';

@Component({
  selector: 'app-ranking-list',
  templateUrl: './ranking-list.component.html',
  styleUrls: ['./ranking-list.component.css']
})
export class RankingListComponent implements OnInit {

  constructor() { }

  @Input() userEntries: UserEntry[] = [];

  ngOnInit() {
  }

}
