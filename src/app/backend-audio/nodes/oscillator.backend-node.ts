import {BackendNode} from './backend-node';
import {BackendAudioService} from '../../backend-audio.service';
import {OscillatorNodeComponent} from '../../ui/nodes/oscillator-node.component';
import {note2freq} from '../../utils';
import {Subscription} from 'rxjs/Subscription';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';

export class OscillatorBackendNode extends BackendNode {
  get input(): AudioNode {
    return null;
  }

  get output(): AudioNode {
    return this.__oscillator;
  }

  protected __oscillator: OscillatorNode;
  protected __frontendNode: OscillatorNodeComponent;

  protected __onPlaySubscription: Subscription;
  protected __onStopSubscription: Subscription;

  protected __typeChangedSubscription: Subscription;
  protected __coarseChangedSubscription: Subscription;
  protected __fineChangedSubscription: Subscription;

  protected __started = false;

  constructor(backendAudioService: BackendAudioService, frontendNode: OscillatorNodeComponent) {
    super(backendAudioService, frontendNode);
  }

  protected __setup(): void {
    super.__setup();
    this.__oscillator = new OscillatorNode(this.__backendAudioService.audioCtx, {
      type: this.__frontendNode.type,
      frequency: this.__calcFrequency()
    });
  }

  protected __teardown(): void {
    super.__teardown();

    if (isNotNullOrUndefined(this.__oscillator) && this.__started) {
      this.__oscillator.stop();
    }

    this.__oscillator = null;
    this.__started = false;
  }

  protected __startSubscriptions(): void {
    super.__startSubscriptions();

    this.__onPlaySubscription = this.__backendAudioService.onPlay.subscribe(this.__onPlay.bind(this));
    this.__onStopSubscription = this.__backendAudioService.onStop.subscribe(this.__onStop.bind(this));

    this.__typeChangedSubscription = this.__frontendNode.onTypeChanged.subscribe(this.__onTypeChanged.bind(this));
    this.__coarseChangedSubscription = this.__frontendNode.onCoarseChanged.subscribe(this.__onCoarseChanged.bind(this));
    this.__fineChangedSubscription = this.__frontendNode.onFineChanged.subscribe(this.__onFineChanged.bind(this));
  }

  protected __endSubscriptions(): void {
    super.__endSubscriptions();

    if (isNotNullOrUndefined(this.__onPlaySubscription)) {
      this.__onPlaySubscription.unsubscribe();
      this.__onPlaySubscription = null;
    }

    if (isNotNullOrUndefined(this.__onStopSubscription)) {
      this.__onStopSubscription.unsubscribe();
      this.__onStopSubscription = null;
    }

    if (isNotNullOrUndefined(this.__typeChangedSubscription)) {
      this.__typeChangedSubscription.unsubscribe();
      this.__typeChangedSubscription = null;
    }

    if (isNotNullOrUndefined(this.__coarseChangedSubscription)) {
      this.__coarseChangedSubscription.unsubscribe();
      this.__coarseChangedSubscription = null;
    }

    if (isNotNullOrUndefined(this.__fineChangedSubscription)) {
      this.__fineChangedSubscription.unsubscribe();
      this.__fineChangedSubscription = null;
    }
  }

  protected __onPlay() {
    if (isNotNullOrUndefined(this.__oscillator) && this.__started === false) {
      this.__oscillator.start();
      this.__started = true;
    }
  }

  protected __onStop() {
    if (isNotNullOrUndefined(this.__oscillator) && this.__started) {
      this.__oscillator.stop();

      this.__softDisconnect();
      this.__teardown();
      this.__setup();
      this.__softConnect();

      this.__started = false;
    }
  }

  protected __onTypeChanged(type: OscillatorType) {
    this.__oscillator.type = type;
  }

  protected __onCoarseChanged(coarse: number) {
    this.__oscillator.frequency.setValueAtTime(this.__calcFrequency(), this.__backendAudioService.audioCtx.currentTime);
  }

  protected __onFineChanged(fine: number) {
    this.__oscillator.frequency.setValueAtTime(this.__calcFrequency(), this.__backendAudioService.audioCtx.currentTime);
  }

  protected __calcFrequency(): number {
    // TODO: MIDI input
    return note2freq(69 + this.__frontendNode.coarse + this.__frontendNode.fine);
  }
}
