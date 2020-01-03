import {
  Component, ComponentFactoryResolver, ComponentRef,
  ContentChild, ElementRef, EventEmitter, HostBinding,
  HostListener,
  OnDestroy, OnInit,
  TemplateRef, ViewChild, ViewContainerRef, ViewRef
} from '@angular/core';
import {NodeComponent} from './nodes/node.component';
import {createMatrixCss} from '../utils';
import {Subscription} from 'rxjs/Subscription';
import {NodeService} from '../node.service';
import {DragAndDropDataTransferService} from '../drag-and-drop-data-transfer.service';
import {isNodeDragAndDropData, NodeDragAndDropData, NodeDragAndDropDataType} from '../drag-and-drop-data';
import {WorkspaceService} from '../workspace.service';
import {NodeType, SimpleNodeConnection} from '../types';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs/Observable';
import {ContextMenuComponent} from 'ngx-contextmenu';

@Component({
  selector: 'app-workspace',
  templateUrl: 'workspace.component.html',
  styleUrls: [
    './workspace.component.scss'
  ]
})
export class WorkspaceComponent implements OnInit, OnDestroy {

  @ContentChild('nodes', {static: true})
  public nodes: TemplateRef<NodeComponent>;

  @ViewChild(
    'workspaceContainerItems',
    {
      static: false,
      read: ViewContainerRef
    }
  )
  public workspaceContainer: ViewContainerRef;

  @ViewChild(
    'nodeConnectionContextMenu',
    {
      static: true,
      read: ContextMenuComponent
    }
  )
  private _nodeConnectionContextMenu: ContextMenuComponent;

  private _positionChangeSubscription: Subscription = null;

  protected __scaleChangeSubscription: Subscription = null;

  protected __nodeRemovedSubscription: Subscription = null;

  protected __nodeConnectionAddedSubscription: Subscription = null;

  protected __nodeConnectionRemovedSubscription: Subscription = null;

  protected __nodeConnections = new Set<SimpleNodeConnection>();

  protected __nodeMap = new Map<NodeComponent, ComponentRef<NodeComponent>>();

  public get transform(): string {
    return this.__transform;
  }

  protected __transform = 'matrix(1, 0, 0, 1, 0, 0)';

  constructor(
    protected __workspace: WorkspaceService,
    protected __dndDataTransfer: DragAndDropDataTransferService,
    protected __nodeService: NodeService,
  ) {
  }

  ngOnInit(): void {
    this._positionChangeSubscription = this
      .__workspace
      .onPositionChange
      .subscribe(this.__onPositionOrScaleChange.bind(this))
    ;

    this.__scaleChangeSubscription = this.__workspace
      .onScaleChange
      .subscribe(this.__onPositionOrScaleChange.bind(this))
    ;

    this.__nodeConnectionAddedSubscription = this
      .__nodeService
      .onNodeConnectionAdded
      .subscribe(this.__onNodeConnectionAdded.bind(this))
    ;

    this.__nodeConnectionRemovedSubscription = this
      .__nodeService
      .onNodeConnectionRemoved
      .subscribe(this.__onNodeConnectionRemoved.bind(this))
    ;

    this.__nodeRemovedSubscription = this
      .__nodeService
      .onNodeRemoved
      .subscribe(this.__onNodeRemoved.bind(this))
    ;
  }

  ngOnDestroy(): void {
    if (this._positionChangeSubscription != null) {
      this._positionChangeSubscription.unsubscribe();
    }
    if (this.__scaleChangeSubscription != null) {
      this.__scaleChangeSubscription.unsubscribe();
    }
    if (this.__nodeRemovedSubscription != null) {
      this.__nodeRemovedSubscription.unsubscribe();
    }
    if (this.__nodeConnectionAddedSubscription != null) {
      this.__nodeConnectionAddedSubscription.unsubscribe();
    }
    if (this.__nodeConnectionRemovedSubscription != null) {
      this.__nodeConnectionRemovedSubscription.unsubscribe();
    }
  }

  protected __onNodeRemoved(node: NodeComponent): void {
    if (this.__nodeMap.has(node) && this.workspaceContainer.indexOf(this.__nodeMap.get(node).hostView) !== -1) {
      this.workspaceContainer.remove(this.workspaceContainer.indexOf(this.__nodeMap.get(node).hostView));
    }
  }

  protected __onNodeConnectionAdded(connection: SimpleNodeConnection): void {
    this.__nodeConnections.add(connection);
  }

  protected __onNodeConnectionRemoved(connection: SimpleNodeConnection): void {
    this.__nodeConnections.delete(connection);
  }

  protected __onPositionOrScaleChange(): void {
    this.__transform = createMatrixCss(this.__workspace.position, this.__workspace.scale);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (event.shiftKey && event.buttons === 1) {
      this.__workspace.position = [this.__workspace.position[0] + event.movementX, this.__workspace.position[1] + event.movementY];
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    if (event.defaultPrevented === false) {
      if (this.__dndDataTransfer.hasType(event, NodeDragAndDropDataType)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    if (event.defaultPrevented === false) {
      const data = this.__dndDataTransfer.fromEvent(event, NodeDragAndDropDataType);
      if (
        data != null
        && isNodeDragAndDropData(data)
        && (<NodeDragAndDropData>data).action === 'move'
      ) {
        data.to = [event.screenX, event.screenY];
        data.ondropped(data);
        this.__dndDataTransfer.removeFromEvent(event);
        event.preventDefault();
      }
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: MouseEvent) {
    if (event.shiftKey) {
      const sign = Math.sign((<any>event).deltaY) * -1;
      this.__workspace.scale = [
        Math.min(
          Math.max(
            this.__workspace.scale[0] + environment.workspace.scrollScale * sign,
            environment.workspace.scrollRange[0]
          ),
          environment.workspace.scrollRange[1]
        ),
        Math.min(
          Math.max(
            this.__workspace.scale[1] + environment.workspace.scrollScale * sign,
            environment.workspace.scrollRange[0]
          ),
          environment.workspace.scrollRange[1]
        )
      ];
    }
  }

  public transformPoint(point: [number, number]): [number, number] {
    return [
      (point[0] - this.__workspace.position[0]) / this.__workspace.scale[0],
      (point[1] - this.__workspace.position[1]) / this.__workspace.scale[1]
    ];
  }

  public addNode(position: [number, number], type: NodeType): void {
    const componentFactory = this.__nodeService.nodeTypeToFactory.get(type);

    const nodeComponentRef: ComponentRef<NodeComponent> = this
      .workspaceContainer
      .createComponent(componentFactory)
    ;

    nodeComponentRef.instance.position = this.transformPoint(position);

    this.__nodeMap.set(nodeComponentRef.instance, nodeComponentRef);
  }

  public removeNodeConnection(connection: SimpleNodeConnection) {
    this.__nodeService.removeConnection(connection);
  }
}
