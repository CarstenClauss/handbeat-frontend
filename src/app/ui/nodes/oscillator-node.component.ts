import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {NodeComponent} from './node.component';
import {FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {NodeType} from '../../types';
import {OscillatorBackendNode} from '../../backend-audio/nodes/oscillator.backend-node';
import {FilterBackendNode} from '../../backend-audio/nodes/filter.backend-node';

@Component({
  selector: 'app-node-oscillator',
  templateUrl: 'oscillator-node.component.html',
  styleUrls: [
    'node.component.scss',
    'node.component.default.scss'
  ]
})
export class OscillatorNodeComponent extends NodeComponent implements OnInit, OnDestroy {
  public readonly nodeType: NodeType = NodeType.Oscillator;
  public readonly requestPianoRoll: boolean = true;

  public get type(): OscillatorType {
    return this._type;
  }

  public set type(value: OscillatorType) {
    this._type = value;
    this._typeChanged.emit(this._type);
  }

  private _type: OscillatorType = 'sine';

  public get onTypeChanged(): Observable<OscillatorType> {
    return this._typeChanged.asObservable();
  }

  private _typeChanged = new EventEmitter<OscillatorType>();

  public get coarse(): number {
    return this._coarse;
  }

  public set coarse(value: number) {
    this._coarse = value;
    this._coarseChanged.emit(this._coarse);
  }

  private _coarse = 0;

  public get onCoarseChanged(): Observable<number> {
    return this._coarseChanged.asObservable();
  }

  private _coarseChanged = new EventEmitter<number>();

  public get fine(): number {
    return this._fine;
  }

  public set fine(value: number) {
    this._fine = value;
    this._fineChanged.emit(this._fine);
  }

  private _fine = 0;

  public get onFineChanged(): Observable<number> {
    return this._fineChanged.asObservable();
  }


  private _fineChanged = new EventEmitter<number>();

  protected __parametersForm = new FormGroup({
    type: new FormControl(this._type),
    coarse: new FormControl(this._coarse),
    fine: new FormControl(this._fine)
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
    this.type = <OscillatorType>(values.type);
    this.coarse = values.coarse;
    this.fine = values.fine;
  }

  createBackendNode(): OscillatorBackendNode {
    return new OscillatorBackendNode(this.__backendAudioService, this);
  }
}
