import {EventEmitter, Injectable} from '@angular/core';
import {NodeComponent} from './ui/nodes/node.component';
import {PianoRollComponent} from './ui/piano-roll.component';
import {NodePianoRoll} from './types';
import {Observable} from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class PianoRollService {
  public get nodePianoRolls(): ReadonlyMap<NodeComponent, PianoRollComponent> {
    return this._nodePianoRolls;
  }

  private _nodePianoRolls = new Map<NodeComponent, PianoRollComponent>();

  public get onNodePianoRollAdded(): Observable<NodePianoRoll> {
    return this._nodePianoRollAdded.asObservable();
  }

  private _nodePianoRollAdded = new EventEmitter<NodePianoRoll>();

  public get onNodePianoRollRemoved(): Observable<NodeComponent> {
    return this._nodePianoRollRemoved.asObservable();
  }

  private _nodePianoRollRemoved = new EventEmitter<NodeComponent>();

  public get onRequestPianoRollFor(): Observable<NodeComponent> {
    return this._requestPianoRollFor.asObservable();
  }

  private _requestPianoRollFor = new EventEmitter<NodeComponent>();

  public addPianoRollFor(node: NodeComponent, pianoRoll: PianoRollComponent): void {
    this._nodePianoRolls.set(node, pianoRoll);
    this._nodePianoRollAdded.emit({
      node: node,
      pianoRoll: pianoRoll
    });
  }

  public removePianoRollFor(node: NodeComponent): void {
    this._nodePianoRolls.delete(node);
  }

  public clearPianoRolls(): void {
    const deleteNodes = this._nodePianoRolls.keys();

    for (const node of deleteNodes) {
      this.removePianoRollFor(node);
    }
  }

  public requestPianoRollFor(node: NodeComponent): void {
    this._requestPianoRollFor.emit(node);
  }
}
