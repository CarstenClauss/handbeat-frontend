import {Directive, ElementRef, HostBinding, HostListener, OnDestroy} from '@angular/core';
import {HandAxisDragAndDropDataType, isHandAxisDragAndDropData} from '../drag-and-drop-data';
import {DragAndDropDataTransferService} from '../drag-and-drop-data-transfer.service';
import {NgControl} from '@angular/forms';
import {Axis, Hand, HandAxis} from '../types';
import {BackendService} from '../backend.service';
import {Subscription} from 'rxjs/Subscription';
import {HandControlService} from '../hand-control.service';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';

@Directive({
  selector: '[appHandAxisControl]'
})
export class HandAxisControlDirective implements OnDestroy {
  public get min(): number {
    if (isNotNullOrUndefined(this.__element.nativeElement.min)) {
      return parseFloat(this.__element.nativeElement.min);
    } else {
      return null;
    }
  }

  public get max(): number {
    if (isNotNullOrUndefined(this.__element.nativeElement.max)) {
      return parseFloat(this.__element.nativeElement.max);
    } else {
      return null;
    }
  }

  public get step(): number {
    if (isNotNullOrUndefined(this.__element.nativeElement.step)) {
      return parseFloat(this.__element.nativeElement.step);
    } else {
      return null;
    }
  }

  protected __connectedHandAxis: HandAxis;

  constructor(
    protected __element: ElementRef,
    protected __control: NgControl,
    protected __handControlService: HandControlService,
    protected __dndDataTransfer: DragAndDropDataTransferService
  ) {
  }

  ngOnDestroy(): void {
    if (isNotNullOrUndefined(this.__connectedHandAxis)) {
      this.__handControlService.disconnect(this.__connectedHandAxis);
    }
  }

  public onDisconnect() {
    this.__connectedHandAxis = null;
  }

  public interpolate(value: number): number {
    let min = this.min;
    if (min == null) {
      min = 0;
    }
    let max = this.max;
    if (max == null) {
      max = Math.max(min, 1);
    }

    const step = this.step;

    const interpolated = (max - min) * value + min;

    if (step != null) {
      return step * Math.floor(interpolated / step);
    } else {
      return interpolated;
    }
  }

  @HostListener('dragover', ['$event'])
  protected __onDragOver(event: DragEvent) {
    if (event.defaultPrevented === false) {
      if (this.__dndDataTransfer.hasType(event, HandAxisDragAndDropDataType)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'link';
      }
    }
  }

  @HostListener('drop', ['$event'])
  protected __onDrop(event: DragEvent) {
    if (event.defaultPrevented === false) {
      const data = this.__dndDataTransfer.fromEvent(event, HandAxisDragAndDropDataType);
      if (
        data != null
        && isHandAxisDragAndDropData(data)
      ) {
        this.__connectedHandAxis = {
          hand: data.hand,
          axis: data.axis
        };
        this.__handControlService.connect(this.__connectedHandAxis, this.__control, this);
        this.__dndDataTransfer.removeFromEvent(event);
        event.preventDefault();
      }
    }
  }
}
