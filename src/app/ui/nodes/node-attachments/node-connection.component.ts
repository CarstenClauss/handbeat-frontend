import {Component, HostBinding, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {NodeSocketComponent} from './node-socket.component';
import {Subscription} from 'rxjs/Subscription';
import {calcBoundingBox, createMatrixCss} from '../../../utils';
import {path} from 'd3';
import {WorkspaceService} from '../../../workspace.service';
import {Rect, SimpleNodeConnection} from '../../../types';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {NodeService} from '../../../node.service';

@Component({
  selector: 'app-node-connection',
  templateUrl: 'node-connection.component.html',
  styles: [
      `:host {
          display: block;
          position: absolute;
          transform-origin: 0 0;
      }`, `svg {
          display: block;
      }`
  ]
})
export class NodeConnectionComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public from: NodeSocketComponent = null;

  @Input()
  public to: NodeSocketComponent = null;

  @Input()
  public lineWidth = 3;

  public get fromPosition(): [number, number] {
    return this.__fromPosition;
  }

  protected __fromPosition: [number, number] = [0, 0];

  public get toPosition(): [number, number] {
    return this.__toPosition;
  }

  protected __toPosition: [number, number] = [0, 0];

  public get boundingBox(): Rect {
    return {
      x: this.__boundingBox.x,
      y: this.__boundingBox.y,
      width: this.__boundingBox.width,
      height: this.__boundingBox.height
    };
  }

  protected __boundingBox: Rect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  protected __path = '';

  @HostBinding('style.transform')
  protected __cssTransformationMatrix = 'matrix(1, 0, 0, 1, 0, 0)';

  protected __viewBox = '0 0 0 0';

  private _fromPositionChangedSubscription: Subscription;
  private _toPositionChangedSubscription: Subscription;
  private _fromOwnerChangedSubscription: Subscription;
  private _toOwnerChangedSubscription: Subscription;

  constructor(
    protected __workspace: WorkspaceService
  ) {
  }

  ngOnInit(): void {
    this._fromPositionChangedSubscription = this.from.owner.onPositionChanged.subscribe(this.redraw.bind(this));
    this._toPositionChangedSubscription = this.to.owner.onPositionChanged.subscribe(this.redraw.bind(this));
    this._fromOwnerChangedSubscription = this.from.onOwnerChanged.subscribe(this.__reassignFromPositionChanged.bind(this));
    this._toOwnerChangedSubscription = this.to.onOwnerChanged.subscribe(this.__reassignToPositionChanged.bind(this));

    if (this.from != null) {
      this.from.addConnection(this);
    }
    if (this.to != null) {
      this.to.addConnection(this);
    }
    this.redraw();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('from' in changes) {
      this.__reassignFromPositionChanged();
      if (isNotNullOrUndefined(<NodeSocketComponent>(changes['from'].previousValue))) {
        (<NodeSocketComponent>(changes['from'].previousValue)).removeConnection(this);
      }
      if (isNotNullOrUndefined(<NodeSocketComponent>(changes['from'].currentValue))) {
        (<NodeSocketComponent>(changes['from'].currentValue)).addConnection(this);
      }

    }
    if ('to' in changes) {
      this.__reassignToPositionChanged();
      if (isNotNullOrUndefined(<NodeSocketComponent>(changes['to'].previousValue))) {
        (<NodeSocketComponent>(changes['to'].previousValue)).removeConnection(this);
      }
      if (isNotNullOrUndefined(<NodeSocketComponent>(changes['to'].currentValue))) {
        (<NodeSocketComponent>(changes['to'].currentValue)).addConnection(this);
      }

    }
  }

  ngOnDestroy(): void {
    if (this._fromPositionChangedSubscription != null) {
      this._fromPositionChangedSubscription.unsubscribe();
    }
    if (this._toPositionChangedSubscription != null) {
      this._toPositionChangedSubscription.unsubscribe();
    }
    if (this._fromOwnerChangedSubscription != null) {
      this._fromOwnerChangedSubscription.unsubscribe();
    }
    if (this._toOwnerChangedSubscription != null) {
      this._toOwnerChangedSubscription.unsubscribe();
    }
  }

  protected __recalculatePositions() {
    const fromRect = this.from.element.nativeElement.getBoundingClientRect();
    const fromNodeRect = this.from.owner.element.nativeElement.getBoundingClientRect();
    const fromNodeOffset = [
      this.from.owner.element.nativeElement.offsetLeft,
      this.from.owner.element.nativeElement.offsetTop
    ];

    this.__fromPosition = [
      this.from.owner.position[0] + (fromRect.x + (fromRect.width / 2) + fromNodeOffset[0] - fromNodeRect.x) / this.__workspace.scale[0],
      this.from.owner.position[1] + (fromRect.y + (fromRect.height / 2) + fromNodeOffset[1] - fromNodeRect.y) / this.__workspace.scale[1]
    ];

    const toRect = this.to.element.nativeElement.getBoundingClientRect();
    const toNodeRect = this.to.owner.element.nativeElement.getBoundingClientRect();
    const toNodeOffset = [
      this.to.owner.element.nativeElement.offsetLeft,
      this.to.owner.element.nativeElement.offsetTop
    ];
    this.__toPosition = [
      this.to.owner.position[0] + (toRect.x + (toRect.width / 2) + toNodeOffset[0] - toNodeRect.x) / this.__workspace.scale[0],
      this.to.owner.position[1] + (toRect.y + (toRect.height / 2) + toNodeOffset[1] - toNodeRect.y) / this.__workspace.scale[1]
    ];

    this.__boundingBox = calcBoundingBox([
      [
        this.__fromPosition[0],
        this.__fromPosition[1]
      ],
      [
        this.__toPosition[0],
        this.__toPosition[1]
      ]
    ]);
  }

  public redraw(): void {
    this.__recalculatePositions();

    this.__cssTransformationMatrix = createMatrixCss([this.__boundingBox.x, this.__boundingBox.y]);

    this.__viewBox = `0 0 ${this.__boundingBox.width + this.lineWidth} ${this.__boundingBox.height + this.lineWidth}`;

    const p = path();
    p.moveTo(
      (this.__fromPosition[0] - this.__boundingBox.x),
      (this.__fromPosition[1] - this.__boundingBox.y)
    );
    p.lineTo(
      (this.__toPosition[0] - this.__fromPosition[0]) + (this.__fromPosition[0] - this.__boundingBox.x),
      (this.__toPosition[1] - this.__fromPosition[1]) + (this.__fromPosition[1] - this.__boundingBox.y)
    );
    this.__path = p.toString();
  }

  protected __reassignFromPositionChanged(): void {
    if (this._fromPositionChangedSubscription != null) {
      this._fromPositionChangedSubscription.unsubscribe();
    }
    this._fromPositionChangedSubscription = this.from.owner.onPositionChanged.subscribe(this.redraw.bind(this));
  }

  protected __reassignToPositionChanged(): void {
    if (this._toPositionChangedSubscription != null) {
      this._toPositionChangedSubscription.unsubscribe();
    }
    this._toPositionChangedSubscription = this.to.owner.onPositionChanged.subscribe(this.redraw.bind(this));
  }
}
