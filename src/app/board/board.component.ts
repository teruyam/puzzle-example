import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import { V1PodList } from '@kubernetes/client-node';
import { AggregationService, AggregationStatus } from '../aggregation.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  constructor(
    private aggregationService: AggregationService
  ) { }

  width = 800;
  height = 800;
  visualCells: VisualCell[] = [];
  cells: Cell[] = [];
  gameBoard: GameBoard;
  enabled: boolean;
  podList: V1PodList;
  aggregationStatus: AggregationStatus;
  logItems: LogItem[] = [];

  ngOnInit() {
    const s = io();
    s.on('getPods', (list: V1PodList) => {
      if (list) {
        this.podList = list;
      }
    });

    this.enabled = true;
    this.gameBoard = new GameBoard();
    this.gameBoard.lengthOfX = 5;
    this.gameBoard.lengthOfY = 10;

    // Game Clock
    setInterval(() => {
      if (!this.enabled) {
        return;
      }
      // Gravity
      this.spawn();
      this.move(0, 1);
    }, 1000);

    // Aggregation Service Polling
    setInterval(() => {
      this.aggregationService.getStatus().subscribe(s => {
        if (!s) {
          return;
        }
        this.aggregationStatus = s;
        this.writeLog('Status has been updated.');
      });
    }, 3000);


    document.addEventListener('keydown', ev => {
      const x = ['ArrowLeft', 'a'].some(k => k === ev.key) ? -1 :
        ['ArrowRight', 'd'].some(k => k === ev.key) ? 1 : 0;
      const y = ['ArrowUp', 'w'].some(k => k === ev.key) ? -1 :
        ['ArrowDown', 's'].some(k => k === ev.key) ? 1 : 0;
      if (x !== 0 || y !== 0) {
        this.move(x, y);
      }
    });
  }

  writeLog(message: string) {
    const li = new LogItem();
    li.date = new Date();
    li.message = message;
    this.logItems.push(li);
  }

  spawn() {
    if (this.cells.some(c => c.enabled)) {
      // There is already active cell.
      return;
    }
    const p = this.podList.items.pop();
    if (!p) {
      return;
    }
    const c = new Cell();
    c.indexOfX = 4;
    c.indexOfY = 0;
    c.enabled = true;
    c.name = p.metadata.name;
    this.cells.push(c);
  }

  reset() {
    this.cells = [];
    this.enabled = true;
  }

  move(changeInX: number, changeInY: number) {
    if (this.cells.length < 1) {
      return;
    }
    const target = this.cells[this.cells.length - 1];
    if (!target.enabled) {
      return;
    }
    // Value Range
    if (changeInX < 0 && target.indexOfX < 1) {
      return;
    }
    if (changeInY < 0 && target.indexOfY < 1) {
      return;
    }
    if (changeInX > 0 && target.indexOfX >= this.gameBoard.lengthOfX - 1) {
      return;
    }
    if (changeInY > 0 && target.indexOfY >= this.gameBoard.lengthOfY - 1) {
      this.disableCell(target);
      return;
    }
    // Hit
    if (this.cells.some(c => c.indexOfX === target.indexOfX + changeInX && c.indexOfY === target.indexOfY + changeInY)) {
      if (changeInY > 0) {
        this.disableCell(target);
      }
      return;
    }
    target.indexOfX += changeInX;
    target.indexOfY += changeInY;

    this.render();
  }

  disableCell(target: Cell) {
    // Deactivate on top
    target.enabled = false;
    // Lose if disabled on top.
    this.enabled = target.indexOfY !== 0;
    // Clear line and Pull all above the line.
    if (this.cells.filter(c => c.indexOfY === target.indexOfY).length === this.gameBoard.lengthOfX) {
      this.cells = this.cells.filter(c => c.indexOfY !== target.indexOfY)
        .map(c => {
          const n = c;
          if (n.indexOfY < target.indexOfY) {
            n.indexOfY += 1;
          }
          return n;
        });
    }
    this.render();
  }

  render() {
    const vcf = new VisualCellFactory();
    this.visualCells = this.cells.map(c => vcf.create(c));
  }
}

class GameBoard {
  lengthOfX: number;
  lengthOfY: number;
}

class Cell {
  indexOfX: number;
  indexOfY: number;
  enabled: boolean;
  name: string;
}

class VisualCell {
  x: number;
  y: number;
  width: number;
  height: number;
  enabled: boolean;
  name: string;
}

class VisualCellFactory {
  width = 70;
  height = 70;
  marginOfX = 5;
  marginOfY = 5;

  create(cell: Cell): VisualCell {
    const vc = new VisualCell();
    vc.x = this.marginOfX + cell.indexOfX * (this.width + this.marginOfX);
    vc.y = this.marginOfY + cell.indexOfY * (this.height + this.marginOfY);
    vc.width = this.width;
    vc.height = this.height;
    vc.enabled = cell.enabled;
    vc.name = cell.name;
    return vc;
  }
}

class LogItem {
  date: Date;
  message: string;
}
