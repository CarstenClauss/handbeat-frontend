import {EventEmitter, Injectable} from '@angular/core';
import {BackendService} from './backend.service';
import {Subscription} from 'rxjs/Subscription';
import {Axis, DetectedHands, Hand, HandAxis, Vector2} from './types';
import {NgControl} from '@angular/forms';
import {HandAxisControlDirective} from './ui/hand-axis-control.directive';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {Observable} from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class HandControlService {
  public get onConnect(): Observable<HandAxis> {
    return this.__onConnect.asObservable();
  }

  protected __onConnect = new EventEmitter<HandAxis>();

  public get onDisconnect(): Observable<HandAxis> {
    return this.__onDisconnect.asObservable();
  }

  protected __onDisconnect = new EventEmitter<HandAxis>();

  protected __connections = new Map<HandAxis, { control: NgControl, handAxisControl: HandAxisControlDirective }>();
  protected __handAxisControlConnectionMap = new Map<HandAxisControlDirective, HandAxis>();
  protected __controlConnectionMap = new Map<NgControl, HandAxis>();

  constructor(
    protected __backendService: BackendService
  ) {
    this.__backendService.onpose.subscribe(this.__onBackendPose.bind(this));
  }

  protected __onBackendPose(poses: [DetectedHands, DetectedHands]) {
    const currentPose = poses[1];

    for (const handAxis of this.__connections.keys()) {
      const connection = this.__connections.get(handAxis);
      const value = this.getAxisFromHand(
        this.getHandFromPose(
          currentPose,
          handAxis.hand
        ),
        handAxis.axis
      );
      if (value != null) {
        connection.control.reset(connection.handAxisControl.interpolate(value));
      }
    }
  }

  public getHandFromPose(pose: DetectedHands, hand: Hand): Vector2 | null {
    switch (hand) {
      case Hand.Left:
        return pose.left;
      case Hand.Right:
        return pose.right;
    }
    return null;
  }

  public getAxisFromHand(hand: Vector2, axis: Axis): number | null {
    if (hand != null) {
      switch (axis) {
        case Axis.x:
          return hand.x;
        case Axis.y:
          return hand.y;
      }
    }
    return null;
  }

  public connect(handAxis: HandAxis, control: NgControl, handAxisControl: HandAxisControlDirective) {
    if (this.__connections.has(handAxis)) {
      this.disconnect(handAxis);
    }
    if (this.__controlConnectionMap.has(control)) {
      this.disconnect(this.__controlConnectionMap.get(control));
    }

    this.__connections.set(handAxis, {
      control: control,
      handAxisControl: handAxisControl
    });

    this.__handAxisControlConnectionMap.set(handAxisControl, handAxis);
    this.__controlConnectionMap.set(control, handAxis);
    this.__onConnect.emit(handAxis);
  }

  public disconnect(handAxis: HandAxis) {
    const localHandAxis = this.findHandAxis(handAxis);
    if (this.__connections.has(localHandAxis)) {
      const controls = this.__connections.get(localHandAxis);
      this.__connections.delete(localHandAxis);
      controls.handAxisControl.onDisconnect();
      if (this.__handAxisControlConnectionMap.has(controls.handAxisControl)) {
        this.__handAxisControlConnectionMap.delete(controls.handAxisControl);
      }

      if (this.__controlConnectionMap.has(controls.control)) {
        this.__controlConnectionMap.delete(controls.control);
      }
      this.__onDisconnect.emit(localHandAxis);
    }
  }

  public findHandAxis(handAxis: HandAxis): HandAxis {
    for (const knownHandAxis of this.__connections.keys()) {
      if (knownHandAxis.hand === handAxis.hand && knownHandAxis.axis === handAxis.axis) {
        return knownHandAxis;
      }
    }

    return null;
  }
}
