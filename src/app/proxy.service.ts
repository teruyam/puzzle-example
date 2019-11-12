import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { V1PodList, V1Pod } from '@kubernetes/client-node';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ProxyService {
  private socket;

  constructor() {
    this.socket = io();
  }

  public getPods(): Observable<V1PodList> {
    console.log('getPodsRequest');
    this.socket.emit('getPodsRequest', '');
    return new Observable<V1PodList>((observer) => {
      this.socket.once('getPodsResponse', (v1PodList: V1PodList) => {
        console.log('getPodsResponse PodList: ', v1PodList);
        observer.next(v1PodList);
      });
    });
  }

  public getAddedPod(): Observable<V1Pod> {
    return new Observable<V1Pod>((observer) => {
      this.socket.on('addedV1Pod', (v1Pod: V1Pod) => {
        console.log('Pod is added: ', v1Pod);
        observer.next(v1Pod);
      });
    });
  }

  public getDeletedPod(): Observable<V1Pod> {
    return new Observable<V1Pod>((observer => {
      this.socket.on('deletedV1Pod', (v1Pod: V1Pod) => {
        console.log('Pod is deleted: ', v1Pod);
        observer.next(v1Pod);
      });
    }));
  }

  public deletePods(names: string[]) {
    console.log('deletePods: ', names);
    this.socket.emit('removePods', names);
  }


}
