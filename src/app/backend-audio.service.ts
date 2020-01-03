import {EventEmitter, Injectable} from '@angular/core';
import {NodeService} from './node.service';
import {NodeComponent} from './ui/nodes/node.component';
import {NodeType, SimpleNodeConnection} from './types';
import {Observable} from 'rxjs/Observable';
import {BackendNode} from './backend-audio/nodes/backend-node';
import {OscillatorNodeComponent} from './ui/nodes/oscillator-node.component';

@Injectable({
  providedIn: 'root'
})
export class BackendAudioService {

  public get audioCtx(): AudioContext {
    return this._audioCtx;
  }

  private _audioCtx = new AudioContext();

  private _nodeMapping = new Map<NodeComponent, BackendNode>();

  public get isPaused(): boolean {
    return this._isPaused;
  }

  private _isPaused = false;

  public get onAudioCtxChanged(): Observable<AudioContext> {
    return this._audioCtxChanged.asObservable();
  }

  private _audioCtxChanged = new EventEmitter<AudioContext>();

  public get onPlay(): Observable<void> {
    return this._playEvt.asObservable();
  }

  private _playEvt = new EventEmitter<void>();

  public get onPause(): Observable<void> {
    return this._pauseEvt.asObservable();
  }

  private _pauseEvt = new EventEmitter<void>();

  public get onStop(): Observable<void> {
    return this._stopEvt.asObservable();
  }

  private _stopEvt = new EventEmitter<void>();

  constructor(private _nodeService: NodeService) {
    _nodeService.onNodeAdded.subscribe(this._onNodeAdded.bind(this));
    _nodeService.onNodeRemoved.subscribe(this._onNodeRemoved.bind(this));

    _nodeService.onNodeConnectionAdded.subscribe(this._onNodeConnectionAdded.bind(this));
    _nodeService.onNodeConnectionRemoved.subscribe(this._onNodeConnectionRemoved.bind(this));
  }

  public play() {
    this._playEvt.emit();
  }

  public pause() {
    if (this._isPaused) {
      this._audioCtx.resume();
    } else {
      this._audioCtx.suspend();
    }
    this._isPaused = !this._isPaused;
    this._pauseEvt.emit();
  }

  public stop() {
    this._stopEvt.emit();
  }

  private _onNodeAdded(nodeComponent: NodeComponent) {
    this._nodeMapping.set(nodeComponent, nodeComponent.createBackendNode());
  }

  private _onNodeRemoved(nodeComponent: NodeComponent) {
    if (this._nodeMapping.has(nodeComponent)) {
      this._nodeMapping.get(nodeComponent).destroy();
      this._nodeMapping.delete(nodeComponent);
    }
  }

  private _onNodeConnectionAdded(nodeConnection: SimpleNodeConnection) {
    if (this._nodeMapping.has(nodeConnection.from.owner) && this._nodeMapping.has(nodeConnection.to.owner)) {
      this._nodeMapping.get(nodeConnection.from.owner).connect(this._nodeMapping.get(nodeConnection.to.owner));
    }
  }

  private _onNodeConnectionRemoved(nodeConnection: SimpleNodeConnection) {
    if (this._nodeMapping.has(nodeConnection.from.owner) && this._nodeMapping.has(nodeConnection.to.owner)) {
      this._nodeMapping.get(nodeConnection.from.owner).disconnect(this._nodeMapping.get(nodeConnection.to.owner));
    }
  }
}
