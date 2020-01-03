import {NodeComponent} from './node.component';
import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {NodeType} from '../../types';
import {AudioSinkBackendNode} from '../../backend-audio/nodes/audio-sink.backend-node';
import {FilterBackendNode} from '../../backend-audio/nodes/filter.backend-node';

@Component({
  selector: 'app-node-audio-sink',
  templateUrl: 'audio-sink-node.component.html',
  styleUrls: [
    'node.component.scss',
    'node.component.default.scss'
  ]
})
export class AudioSinkNodeComponent extends NodeComponent implements OnInit, OnDestroy {
  public readonly nodeType: NodeType = NodeType.AudioSink;

  public get gain(): number {
    return this._gain;
  }

  public set gain(value: number) {
    this._gain = value;
    this._gainChanged.emit(this._gain);
  }

  private _gain = 1;

  public get onGainChanged(): Observable<number> {
    return this._gainChanged.asObservable();
  }

  private _gainChanged = new EventEmitter<number>();

  protected __parametersForm = new FormGroup({
    gain: new FormControl(this._gain)
  });

  private _onChangeSubscription: Subscription = null;

  ngOnInit(): void {
    super.ngOnInit();
    this._onChangeSubscription = this.__parametersForm.valueChanges.subscribe(this.__onChange.bind(this));
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    if (this._onChangeSubscription != null) {
      this._onChangeSubscription.unsubscribe();
    }
  }

  protected __onChange(values: any) {
    this.gain = values.gain;
  }

  createBackendNode(): AudioSinkBackendNode {
    return new AudioSinkBackendNode(this.__backendAudioService, this);
  }
}
