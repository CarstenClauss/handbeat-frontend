import {EventEmitter, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {String} from 'typescript-string-operations';
import {DetectedHands} from './types';
import {checkBitFlag} from './utils';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  public get width(): number {
    return this._width;
  }

  private _width = 0;

  public get height(): number {
    return this._height;
  }

  private _height = 0;

  public get onpose(): EventEmitter<[DetectedHands, DetectedHands]> {
    return this._evt;
  }

  private _evt = new EventEmitter<[DetectedHands, DetectedHands]>();

  public get lastPose(): DetectedHands {
    return this._lastPose;
  }

  private _lastPose: DetectedHands = null;

  public connected = false;
  private _ws: WebSocket;

  public sendFrame(image: ImageData) {
    if (this.connected) {
      this._ws.send(image.data);
    }
  }

  public tryConnect(width: number, height: number): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      this.connect(width, height).then(() => {
        console.log('Connected to backend');
        this._width = width;
        this._height = height;
        resolve();
      }).catch(() => {
        console.error('Couldn\'t connect to backend');
        reject();
      });
    }));
  }

  private async connect(width: number, height: number): Promise<void> {
    if (this.connected === false) {
      this._ws = new WebSocket(
        String.Format(
          'ws://{0}:{1}{2}/{3}x{4}',
          environment.backend.host,
          environment.backend.port,
          environment.backend.uri,
          width,
          height
        )
      );
      this._ws.binaryType = 'arraybuffer';
      this._ws.onmessage = (ev => {
        this.handleBackendMessage(ev.data);
      });
    }
  }

  private handleBackendMessage(message: ArrayBuffer): void {
    if (message.byteLength === environment.backend.message.num_bytes) {
      const mask = new Uint8Array(message.slice(0, 1));
      const values = new Float32Array(message.slice(1, environment.backend.message.num_bytes));

      const result: DetectedHands = {
        left: null,
        right: null
      };

      if (checkBitFlag(mask[0], environment.backend.message.mask.hand_left)) {
        result.left = {
          x: values[0],
          y: values[1]
        };
      }

      if (checkBitFlag(mask[0], environment.backend.message.mask.hand_right)) {
        result.right = {
          x: values[2],
          y: values[3]
        };
      }

      this._lastPose = result;

      this._evt.emit([this._lastPose, result]);
    }
  }
}
