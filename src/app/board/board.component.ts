import { Component, OnInit } from '@angular/core';
import { V1Pod } from '@kubernetes/client-node';
import { ProxyService } from '../proxy.service';
import { UserEntry } from '../user-entry';
import { UserEntryService } from '../user-entry.service';
import { ClrLoadingState } from '@clr/angular';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  constructor(
    private proxyService: ProxyService,
    private userEntryService: UserEntryService,
  ) { }

  width = 800;
  height = 800;
  visualCells: VisualCell[] = [];
  cells: Cell[] = [];
  gameBoard: GameBoard;
  enabled: boolean;
  pods: V1Pod[] = [];
  score = 0;
  scoreTiers = [500000, 100000, 50000, 10000, 5000];
  username = '';
  userEntryState = ClrLoadingState.DEFAULT;

  shuffle(pods: V1Pod[]) {
    for (let i = 0; i < pods.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      [pods[i], pods[j]] = [pods[j], pods[i]];
    }
    return pods;
  }

  ngOnInit() {
    // Pod Synchronization.
    // Step 1. Initialization
    // Retrieve full list of pods from proxy.
    // Step 2. Handle + / - events
    // Synchronize pod cache state with added / deleted events.
    this.proxyService.getPods().subscribe(podList => {
      if (!podList) {
        return;
      }
      this.pods = this.shuffle(podList.items);
      this.proxyService.getAddedPod().subscribe(pod => {
        if (!pod) {
          return;
        }
        if (this.pods.some(p => p.metadata.name === pod.metadata.name)) {
          // If there is existing pod matches, pushing does not happen.
          return;
        }
        this.pods.push(pod);
      });
      this.proxyService.getDeletedPod().subscribe(pod => {
        if (!pod) {
          return;
        }
        if (!this.pods.some(p => p.metadata.name === pod.metadata.name)) {
          // If deleted pod does not hit the cache, deletion does not happen.
          return;
        }
        this.pods = this.pods.filter(p => p.metadata.name !== pod.metadata.name);
      });
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

  spawn() {
    if (this.cells.some(c => c.enabled)) {
      // There is already active cell.
      return;
    }
    const p = this.pods.shift();
    if (!p) {
      return;
    }
    const cell = new Cell();
    cell.indexOfX = 2;
    cell.indexOfY = 0;
    cell.enabled = true;
    cell.name = p.metadata.name;
    if (p.metadata.labels.app) {
      cell.label = p.metadata.labels.app;
    }
    this.cells.push(cell);
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
    const disabledCells = this.cells.filter(c => c.indexOfY === target.indexOfY);
    if (disabledCells.length === this.gameBoard.lengthOfX) {
      this.calculateScore(disabledCells);
      this.deletePods(disabledCells.map(c => c.name));
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

  calculateScore(cells: Cell[]) {
    this.score += cells.map(c => c.name.length).reduce((p, c) => p + c) * 1000;
  }

  submitScore() {
    const userEntry = new UserEntry();
    userEntry.name = this.username;
    userEntry.score = this.score;
    this.userEntryState = ClrLoadingState.LOADING;
    this.userEntryService.postUserEntry(userEntry)
      .subscribe(
        ue => {
          this.userEntryState = ClrLoadingState.SUCCESS;
          console.log('User Entry succeeded!');
        },
        e => {
          this.userEntryState = ClrLoadingState.ERROR;
          console.log('User Entry failed', e);
        });
  }

  deletePods(names: string[]) {
    if (!names) {
      console.log('Unable to delete pods with name:', names);
    }
    this.proxyService.deletePods(names);
  }

  render() {
    const vcf = new VisualCellFactory();
    this.visualCells = this.cells.map(c => vcf.create(c));
  }

  pushToTop(pod: V1Pod) {
    this.pods = this.pods.filter(p => p.metadata.name !== pod.metadata.name);
    this.pods.unshift(pod);
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
  label: string;
}

class VisualCell {
  x: number;
  y: number;
  width: number;
  height: number;
  enabled: boolean;
  name: string;
  label: string;
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
    vc.label = cell.label;
    return vc;
  }
}

class LogItem {
  date: Date;
  message: string;
}
