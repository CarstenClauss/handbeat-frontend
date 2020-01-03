import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Axis, DetectedHands, Hand, HandAxis, NodeSocketDirection, Vector2} from '../types';
import {BackendService} from '../backend.service';
import {Subscription} from 'rxjs/Subscription';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {HandControlService} from '../hand-control.service';
import {HandAxisDragAndDropData, SocketDragAndDropData} from '../drag-and-drop-data';
import {DragAndDropDataTransferService} from '../drag-and-drop-data-transfer.service';

@Component({
  selector: 'app-hand-control',
  templateUrl: 'hand-control.component.html',
  styleUrls: [
    'hand-control.component.scss'
  ]
})
export class HandControlComponent implements OnInit, OnDestroy {
  @Input()
  public hand: Hand;

  @ViewChild(
    'xAxis',
    {
      static: false,
      read: ElementRef
    }
  )
  protected __xAxisElem: ElementRef;

  @ViewChild(
    'yAxis',
    {
      static: false,
      read: ElementRef
    }
  )
  protected __yAxisElem: ElementRef;

  protected __xConnected = false;
  protected __yConnected = false;

  protected __currentHandPosition: Vector2 = null;

  protected __onHandAxisConnectSubscription: Subscription;
  protected __onHandAxisDisconnectSubscription: Subscription;

  protected __onPoseSubscription: Subscription;

  constructor(
    protected __backendService: BackendService,
    protected __handControlService: HandControlService,
    protected __dndDataTransfer: DragAndDropDataTransferService
  ) {
  }

  ngOnInit(): void {
    this.__onPoseSubscription = this.__backendService.onpose.subscribe(this.__onPose.bind(this));

    this.__onHandAxisConnectSubscription = this.__handControlService.onConnect.subscribe(this.__onHandAxisConnect.bind(this));
    this.__onHandAxisDisconnectSubscription = this.__handControlService.onDisconnect.subscribe(this.__onHandAxisDisconnect.bind(this));
  }

  ngOnDestroy(): void {
    if (isNotNullOrUndefined(this.__onPoseSubscription)) {
      this.__onPoseSubscription.unsubscribe();
      this.__onPoseSubscription = null;
    }

    if (isNotNullOrUndefined(this.__onHandAxisConnectSubscription)) {
      this.__onHandAxisConnectSubscription.unsubscribe();
      this.__onHandAxisConnectSubscription = null;
    }

    if (isNotNullOrUndefined(this.__onHandAxisDisconnectSubscription)) {
      this.__onHandAxisDisconnectSubscription.unsubscribe();
      this.__onHandAxisDisconnectSubscription = null;
    }
  }

  protected __onHandAxisConnect(handAxis: HandAxis) {
    if (handAxis.hand === this.hand) {
      switch (handAxis.axis) {
        case Axis.x:
          this.__xConnected = true;
          break;
        case Axis.y:
          this.__yConnected = true;
          break;
      }
    }
  }

  protected __onHandAxisDisconnect(handAxis: HandAxis) {
    if (handAxis.hand === this.hand) {
      switch (handAxis.axis) {
        case Axis.x:
          this.__xConnected = false;
          break;
        case Axis.y:
          this.__yConnected = false;
          break;
      }
    }
  }

  protected __onAxisDragStart(event: DragEvent, axis: Axis) {
    const axisElement = this.__getElementForAxis(axis);
    if (event.defaultPrevented === false && axisElement != null && event.target === axisElement.nativeElement) {
      event.dataTransfer.dropEffect = 'link';

      event.cancelBubble = true;

      const eventData = new HandAxisDragAndDropData(this.hand, axis);
      this.__dndDataTransfer.toEvent(event, eventData);
      event.dataTransfer.setDragImage(axisElement.nativeElement, 0, 0);
    }
  }

  protected __getElementForAxis(axis: Axis): ElementRef {
    switch (axis) {
      case Axis.x:
        return this.__xAxisElem;
      case Axis.y:
        return this.__yAxisElem;
    }
    return null;
  }

  protected __onPose(result: [DetectedHands, DetectedHands]) {
    switch (this.hand) {
      case Hand.Left:
        if (result[1].left != null) {
          this.__currentHandPosition = {
            x: result[1].left.x * 100,
            y: result[1].left.y * 100
          };
        }
        break;
      case Hand.Right:
        if (result[1].right != null) {
          this.__currentHandPosition = {
            x: result[1].right.x * 100,
            y: result[1].right.y * 100
          };
        }
        break;
    }
  }
}
