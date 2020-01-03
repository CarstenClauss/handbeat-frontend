import {Component, ElementRef, EventEmitter, HostBinding, OnDestroy, OnInit, Output, ViewChild, ViewRef} from '@angular/core';
import {BackendAudioService} from '../backend-audio.service';
import {Subscription} from 'rxjs/Subscription';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {HandControlsComponent} from './hand-controls.component';


@Component({
  selector: 'app-controlls',
  templateUrl: './controlls.component.html',
  styleUrls: [
    './controlls.component.scss'
  ]
})
export class ControllsComponent implements OnInit, OnDestroy {
  @Output()
  public toggleHandControls = new EventEmitter<void>();

  protected __isPaused = false;

  protected __pauseSubscription: Subscription;

  constructor(
    protected __backendAudioService: BackendAudioService
  ) {

  }

  ngOnInit(): void {
    this.__pauseSubscription = this.__backendAudioService.onPause.subscribe(this.__onPause.bind(this));
  }

  ngOnDestroy(): void {
    if (isNotNullOrUndefined(this.__pauseSubscription)) {
      this.__pauseSubscription.unsubscribe();
      this.__pauseSubscription = null;
    }
  }

  protected __onPause() {
    this.__isPaused = this.__backendAudioService.isPaused;
  }

  public play(): void {
    this.__backendAudioService.play();
  }

  public pause(): void {
    this.__backendAudioService.pause();
  }

  public stop(): void {
    this.__backendAudioService.stop();
  }
}
