import {NodeComponent} from '../../ui/nodes/node.component';
import {BackendAudioService} from '../../backend-audio.service';
import {Subscription} from 'rxjs/Subscription';

export abstract class BackendNode {
  public abstract get input(): AudioNode;

  public abstract get output(): AudioNode;

  protected _inputs: BackendNode[] = [];
  protected _outputs: BackendNode[] = [];

  protected __backendAudioService: BackendAudioService;
  protected __frontendNode: NodeComponent;

  protected __audioCtxChangedSubscription: Subscription = null;

  constructor(backendAudioService: BackendAudioService, frontendNode: NodeComponent) {
    this.__backendAudioService = backendAudioService;
    this.__frontendNode = frontendNode;

    this.__setup();
    this.__startSubscriptions();
  }

  protected __setup(): void {

  }

  protected __teardown(): void {

  }

  protected __resetSubscriptions(): void {
    this.__endSubscriptions();
    this.__startSubscriptions();
  }

  protected __startSubscriptions(): void {
    this.__audioCtxChangedSubscription = this.__backendAudioService.onAudioCtxChanged.subscribe(this.__onAudioCtxChanged.bind(this));
  }

  protected __endSubscriptions(): void {
    if (this.__audioCtxChangedSubscription != null) {
      this.__audioCtxChangedSubscription.unsubscribe();
      this.__audioCtxChangedSubscription = null;
    }
  }

  protected __onAudioCtxChanged(audioCtx: AudioContext) {
    this.__endSubscriptions();
    this.__softDisconnect();
    this.__teardown();
    this.__setup();
    this.__softConnect();
    this.__startSubscriptions();
  }

  public connect(node: BackendNode): void {
    this._outputs.push(node);
    node.connectionFrom(this);
  }

  public connectionFrom(node: BackendNode): void {
    this._inputs.push(node);

    this.__backendConnect(node, this);
  }

  public disconnect(node: BackendNode): void {
    if (this._outputs.includes(node)) {
      this._outputs.splice(this._outputs.indexOf(node), 1);
    }
    node.disconnectFrom(this);
  }

  public disconnectFrom(node: BackendNode): void {
    if (this._inputs.includes(node)) {
      this._inputs.splice(this._inputs.indexOf(node), 1);
    }

    this.__backendDisconnect(node, this);
  }

  protected __softConnect(): void {
    const connect = Object.assign([], this._inputs);

    for (const node of connect) {
      this.__backendConnect(node, this);
    }

    const connectFrom = Object.assign([], this._outputs);

    for (const node of connectFrom) {
      this.__backendConnect(this, node);
    }
  }

  protected __softDisconnect(): void {
    const disconnect = Object.assign([], this._inputs);

    for (const node of disconnect) {
      this.__backendDisconnect(node, this);
    }

    const disconnectFrom = Object.assign([], this._outputs);

    for (const node of disconnectFrom) {
      this.__backendDisconnect(this, node);
    }
  }

  protected __backendConnect(a: BackendNode, b: BackendNode): void {
    a.output.connect(b.input);
  }

  protected __backendDisconnect(a: BackendNode, b: BackendNode): void {
    a.output.disconnect(b.input);
  }

  public destroy(): void {
    this.__endSubscriptions();

    const disconnect = Object.assign([], this._inputs);

    for (const node of disconnect) {
      node.disconnect(this);
    }

    const disconnectFrom = Object.assign([], this._outputs);

    for (const node of disconnectFrom) {
      node.disconnectFrom(this);
    }

    this.__teardown();
  }
}
