import {BackendNode} from './backend-node';
import {AudioSinkNodeComponent} from '../../ui/nodes/audio-sink-node.component';
import {Subscription} from 'rxjs/Subscription';
import {BackendAudioService} from '../../backend-audio.service';

export class AudioSinkBackendNode extends BackendNode {
  get input(): AudioNode {
    return this.__gain;
  }

  get output(): AudioNode {
    return null;
  }

  protected __sink: AudioDestinationNode;
  protected __gain: GainNode;

  protected __frontendNode: AudioSinkNodeComponent;

  protected __gainChangedSubscription: Subscription;

  constructor(backendAudioService: BackendAudioService, frontendNode: AudioSinkNodeComponent) {
    super(backendAudioService, frontendNode);
  }

  protected __setup(): void {
    super.__setup();

    this.__gain = new GainNode(this.__backendAudioService.audioCtx, {
      gain: this.__frontendNode.gain
    });

    this.__sink = this.__backendAudioService.audioCtx.destination;

    this.__gain.connect(this.__sink);
  }

  protected __teardown(): void {
    super.__teardown();

    this.__gain.disconnect(this.__sink);

    this.__gain = null;
    this.__sink = null;
  }

  protected __startSubscriptions(): void {
    super.__startSubscriptions();

    this.__gainChangedSubscription = this.__frontendNode.onGainChanged.subscribe(this.__onGainChanged.bind(this));
  }

  protected __endSubscriptions(): void {
    super.__endSubscriptions();

    if (this.__gainChangedSubscription != null) {
      this.__gainChangedSubscription.unsubscribe();
      this.__gainChangedSubscription = null;
    }
  }

  protected __onGainChanged(gain: number) {
    this.__gain.gain.setValueAtTime(gain, this.__backendAudioService.audioCtx.currentTime);
  }
}
