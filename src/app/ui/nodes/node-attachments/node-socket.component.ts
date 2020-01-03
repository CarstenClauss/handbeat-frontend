import {Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, OnInit, Self, SimpleChanges} from '@angular/core';
import {DragAndDropDataTransferService} from '../../../drag-and-drop-data-transfer.service';
import {isSocketDragAndDropData, SocketDragAndDropData, SocketDragAndDropDataType} from '../../../drag-and-drop-data';
import {WorkspaceService} from '../../../workspace.service';
import {NodeSocketDirection, SimpleNodeConnection} from '../../../types';
import {NodeComponent} from '../node.component';
import {NodeConnectionComponent} from './node-connection.component';
import {Observable} from 'rxjs/Observable';
import {NgClass} from '@angular/common';
import {NodeService} from '../../../node.service';

@Component({
  selector: 'app-node-socket',
  template: '&bull;',
  styleUrls: [
    'node-socket.component.scss'
  ]
})
export class NodeSocketComponent implements OnInit, OnChanges {
  @Input()
  public type = 'audio';

  @Input()
  public owner: NodeComponent;

  @Input()
  public direction: NodeSocketDirection = NodeSocketDirection.Both;

  public get relativePosition(): [number, number] {
    const rect = this.element.nativeElement.getBoundingClientRect();
    const ownerRect = this.owner.element.nativeElement.getBoundingClientRect();

    return [
      this.owner.position[0] + ((rect.x - ownerRect.x) / this.__workspace.scale[0]),
      this.owner.position[1] + ((rect.y - ownerRect.y) / this.__workspace.scale[1])
    ];
  }

  public get onOwnerChanged(): Observable<NodeComponent> {
    return this._ownerChanged;
  }

  private _ownerChanged = new EventEmitter<NodeComponent>();

  public get connections(): NodeConnectionComponent[] {
    return this._connections;
  }

  private _connections: NodeConnectionComponent[] = [];

  @HostBinding('draggable')
  protected __draggable = true;

  public get element(): ElementRef {
    return this.__elementRef;
  }

  @HostBinding('class.type-audio')
  protected __isAudioType = true;

  @HostBinding('class.type-parameter')
  protected __isParameterType = false;

  @HostBinding('class.type-note')
  protected __isNoteType = false;

  constructor(
    protected __elementRef: ElementRef,
    protected __dndDataTransfer: DragAndDropDataTransferService,
    protected __workspace: WorkspaceService,
    protected __nodes: NodeService
  ) {
  }

  ngOnInit(): void {
    this.__checkType();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('type' in changes) {
      this.__checkType();
    }
    if ('owner' in changes) {
      this._ownerChanged.emit(this.owner);
    }
  }

  public addConnection(connection: NodeConnectionComponent): void {
    this._connections.push(connection);
  }

  public removeConnection(connection: NodeConnectionComponent): void {
    if (this._connections.includes(connection)) {
      this._connections.splice(this._connections.indexOf(connection), 1);
    }
  }

  protected __checkType(): void {
    if (this.type === 'audio') {
      this.__isAudioType = true;
      this.__isParameterType = false;
      this.__isNoteType = false;
    } else if (this.type === 'parameter') {
      this.__isAudioType = false;
      this.__isParameterType = true;
      this.__isNoteType = false;
    } else if (this.type === 'note') {
      this.__isAudioType = false;
      this.__isParameterType = false;
      this.__isNoteType = true;
    } else {
      this.__isAudioType = false;
      this.__isParameterType = false;
      this.__isNoteType = false;
    }
  }

  @HostListener('dragstart', ['$event'])
  public onDragStart(event: DragEvent) {
    if (event.defaultPrevented === false && event.target === this.element.nativeElement) {
      event.dataTransfer.dropEffect = 'link';
      event.cancelBubble = true;

      const eventData = new SocketDragAndDropData(
        this,
        (this.direction !== NodeSocketDirection.Both) ? this.direction : NodeSocketDirection.Out
      );

      this.__dndDataTransfer.toEvent(event, eventData);
      event.dataTransfer.setDragImage(this.element.nativeElement, 0, 0);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    if (event.defaultPrevented === false) {
      if (
        this.__dndDataTransfer.hasType(event, SocketDragAndDropDataType)
      ) {
        event.dataTransfer.dropEffect = 'link';
        event.preventDefault();
      }
    }
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent) {
    if (event.defaultPrevented === false) {
      const data = this.__dndDataTransfer.fromEvent(event, SocketDragAndDropDataType);
      if (
        data != null
        && isSocketDragAndDropData(data)
        && (<SocketDragAndDropData>data).socket !== this
        && (<SocketDragAndDropData>data).socket.type === this.type
        && (<SocketDragAndDropData>data).direction !== this.direction
        && (<SocketDragAndDropData>data).direction !== NodeSocketDirection.Both
      ) {
        const connection = new SimpleNodeConnection();

        if (data.socket.direction === NodeSocketDirection.In) {
          connection.from = this;
          connection.to = data.socket;
        } else {
          connection.from = data.socket;
          connection.to = this;
        }

        this.__nodes.addConnection(connection);
      }
    }
  }
}
