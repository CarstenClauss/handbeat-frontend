import {BackendNode} from './backend-node';
import {FilterNodeComponent} from '../../ui/nodes/filter-node.component';
import {BackendAudioService} from '../../backend-audio.service';
import {Subscription} from 'rxjs/Subscription';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';

export class FilterBackendNode extends BackendNode {
  get input(): AudioNode {
    return this.__filter;
  }

  get output(): AudioNode {
    return this.__filter;
  }

  protected __frontendNode: FilterNodeComponent;

  protected __filter: BiquadFilterNode;

  protected __typeChangedSubscription: Subscription;
  protected __frequencyChangedSubscription: Subscription;
  protected __qChangedSubscription: Subscription;
  protected __gainChangedSubscription: Subscription;

  constructor(backendAudioService: BackendAudioService, frontendNode: FilterNodeComponent) {
    super(backendAudioService, frontendNode);
  }

  protected __setup(): void {
    super.__setup();

    this.__filter = new BiquadFilterNode(this.__backendAudioService.audioCtx, {
      type: this.__frontendNode.type,
      frequency: this.__frontendNode.frequencyExp,
      Q: this.__frontendNode.q,
      gain: this.__frontendNode.gain
    });
  }

  protected __teardown(): void {
    super.__teardown();

    this.__filter = null;
  }

  protected __startSubscriptions(): void {
    super.__startSubscriptions();

    this.__typeChangedSubscription = this.__frontendNode.onTypeChanged.subscribe(this.__onTypeChanged.bind(this));
    this.__frequencyChangedSubscription = this.__frontendNode.onFrequencyExpChanged.subscribe(this.__onFrequencyChanged.bind(this));
    this.__qChangedSubscription = this.__frontendNode.onQChanged.subscribe(this.__onQChanged.bind(this));
    this.__gainChangedSubscription = this.__frontendNode.onGainChanged.subscribe(this.__onGainChanged.bind(this));
  }

  protected __endSubscriptions(): void {
    super.__endSubscriptions();

    if (isNotNullOrUndefined(this.__typeChangedSubscription)) {
      this.__typeChangedSubscription.unsubscribe();
      this.__typeChangedSubscription = null;
    }

    if (isNotNullOrUndefined(this.__frequencyChangedSubscription)) {
      this.__frequencyChangedSubscription.unsubscribe();
      this.__frequencyChangedSubscription = null;
    }

    if (isNotNullOrUndefined(this.__qChangedSubscription)) {
      this.__qChangedSubscription.unsubscribe();
      this.__qChangedSubscription = null;
    }

    if (isNotNullOrUndefined(this.__gainChangedSubscription)) {
      this.__gainChangedSubscription.unsubscribe();
      this.__gainChangedSubscription = null;
    }
  }

  protected __onTypeChanged(type: BiquadFilterType) {
    this.__filter.type = type;
  }

  protected __onFrequencyChanged(frequency: number) {
    this.__filter.frequency.setValueAtTime(frequency, this.__backendAudioService.audioCtx.currentTime);
  }

  protected __onQChanged(q: number) {
    this.__filter.Q.setValueAtTime(q, this.__backendAudioService.audioCtx.currentTime);
  }

  protected __onGainChanged(gain: number) {
    this.__filter.gain.setValueAtTime(gain, this.__backendAudioService.audioCtx.currentTime);
  }
}
