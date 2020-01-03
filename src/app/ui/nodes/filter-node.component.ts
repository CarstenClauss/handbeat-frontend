import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {NodeComponent} from './node.component';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {NodeType} from '../../types';
import {FilterBackendNode} from '../../backend-audio/nodes/filter.backend-node';

@Component({
  selector: 'app-node-filter',
  templateUrl: 'filter-node.component.html',
  styleUrls: [
    'node.component.scss',
    'node.component.default.scss'
  ]
})
export class FilterNodeComponent extends NodeComponent implements OnInit, OnDestroy {
  public readonly nodeType: NodeType = NodeType.Filter;

  public get type(): BiquadFilterType {
    return this._type;
  }

  public set type(value: BiquadFilterType) {
    this._type = value;
    this._typeChanged.emit(this._type);
  }

  private _type: BiquadFilterType = 'lowpass';

  public get onTypeChanged(): Observable<BiquadFilterType> {
    return this._typeChanged.asObservable();
  }

  private _typeChanged = new EventEmitter<BiquadFilterType>();

  public get frequencyExp(): number {
    return 2 ** this.frequency;
  }

  public get frequency(): number {
    return this._frequency;
  }

  public set frequency(value: number) {
    this._frequency = value;
    this._frequencyChanged.emit(this._frequency);
    this._frequencyExpChanged.emit(this.frequencyExp);
  }

  private _frequency = 14.3;

  public get onFrequencyExpChanged(): Observable<number> {
    return this._frequencyExpChanged.asObservable();
  }

  private _frequencyExpChanged = new EventEmitter<number>();

  public get onFrequencyChanged(): Observable<number> {
    return this._frequencyChanged.asObservable();
  }

  private _frequencyChanged = new EventEmitter<number>();

  public get q(): number {
    return this._q;
  }

  public set q(value: number) {
    this._q = value;
    this._qChanged.emit(this._q);
  }

  private _q = 0;

  public get onQChanged(): Observable<number> {
    return this._qChanged.asObservable();
  }

  private _qChanged = new EventEmitter<number>();

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
    type: new FormControl(this._type),
    frequency: new FormControl(this._frequency),
    q: new FormControl(this._q),
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
    this.type = <BiquadFilterType>(values.type);
    this.frequency = values.frequency;
    this.q = values.q;
    this.gain = values.gain;
  }

  createBackendNode(): FilterBackendNode {
    return new FilterBackendNode(this.__backendAudioService, this);
  }
}
