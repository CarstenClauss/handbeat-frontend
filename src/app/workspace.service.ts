import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {createMatrixCss} from './utils';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  public get position(): [number, number] {
    return this._position;
  }

  public set position(value: [number, number]) {
    this._position = value;
    this._positionChange.emit(this.position);
    this._transformChange.emit([this.position, this.scale]);
  }

  private _position: [number, number] = [0, 0];

  public get onPositionChange(): Observable<[number, number]> {
    return this._positionChange.asObservable();
  }

  private _positionChange = new EventEmitter<[number, number]>();

  public get scale(): [number, number] {
    return this._scale;
  }

  public set scale(value: [number, number]) {
    this._scale = value;
    this._scaleChange.emit(this.scale);
    this._transformChange.emit([this.position, this.scale]);
  }

  private _scale: [number, number] = [1, 1];

  public get onScaleChange(): Observable<[number, number]> {
    return this._scaleChange.asObservable();
  }

  private _scaleChange = new EventEmitter<[number, number]>();

  public get onTransformChange(): Observable<[[number, number], [number, number]]> {
    return this._transformChange.asObservable();
  }

  private _transformChange = new EventEmitter<[[number, number], [number, number]]>();
}
