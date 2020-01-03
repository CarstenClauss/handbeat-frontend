import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit, ViewChild,
} from '@angular/core';
import {createMatrixCss} from '../../utils';
import {Subscription} from 'rxjs/Subscription';
import {NodeService} from '../../node.service';
import {DragAndDropDataTransferService} from '../../drag-and-drop-data-transfer.service';
import {NodeDragAndDropData} from '../../drag-and-drop-data';
import {WorkspaceService} from '../../workspace.service';
import {Observable} from 'rxjs/Observable';
import {NodeType} from '../../types';
import {BackendNode} from '../../backend-audio/nodes/backend-node';
import {BackendAudioService} from '../../backend-audio.service';
import {ContextMenuComponent, ContextMenuService} from 'ngx-contextmenu';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {ContextMenuAttachDirective} from 'ngx-contextmenu/lib/contextMenu.attach.directive';
import {PianoRollService} from '../../piano-roll.service';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'app-node',
  template: `<span>Node</span>`,
  styleUrls: [
    'node.component.scss'
  ]
})
export abstract class NodeComponent implements OnInit, OnDestroy {
  public readonly nodeType: NodeType = null;
  public readonly requestPianoRoll: boolean = false;

  public get position(): [number, number] {
    return this._position;
  }

  @Input()
  public set position(value: [number, number]) {
    this._position = value;
    this._positionChange.emit(this._position);
  }

  private _position: [number, number] = [0, 0];

  public get onPositionChanged(): Observable<[number, number]> {
    return this._positionChange.asObservable();
  }

  private _positionChange = new EventEmitter<[number, number]>();

  private _positionChangeSubscription: Subscription = null;

  protected __invertedWorkspaceTransform = 'matrix(1, 0, 0, 1, 0, 0)';
  private _workspaceTransformChangedSubscription: Subscription;

  @HostBinding('style.transform')
  private _transform = 'matrix(1, 0, 0, 1, 0, 0)';

  @HostBinding('draggable')
  protected __isDragable = true;

  public get element(): ElementRef {
    return this.__elementRef;
  }

  @ViewChild(
    'nodeContextMenu',
    {
      static: true,
      read: ContextMenuComponent
    }
  )
  private _nodeContextMenu: ContextMenuComponent;

  constructor(
    protected __elementRef: ElementRef,
    protected __nodeService: NodeService,
    protected __dndDataTransfer: DragAndDropDataTransferService,
    protected __workspace: WorkspaceService,
    protected __backendAudioService: BackendAudioService,
    protected __contextMenuService: ContextMenuService,
    protected __pianoRollService: PianoRollService
  ) {
  }

  ngOnInit(): void {
    this._positionChangeSubscription = this.onPositionChanged.subscribe(this.__onPositionOrScaleChange.bind(this));
    this._workspaceTransformChangedSubscription = this
      .__workspace
      .onTransformChange
      .subscribe(this.__recalcInvertedWorkspaceTransform.bind(this))
    ;
    this.__onPositionOrScaleChange();
    this.__nodeService.addNode(this);

    if (this.requestPianoRoll) {
      this.__pianoRollService.requestPianoRollFor(this);
    }
  }

  ngOnDestroy(): void {
    if (this._positionChangeSubscription != null) {
      this._positionChangeSubscription.unsubscribe();
    }
    if (this._workspaceTransformChangedSubscription != null) {
      this._workspaceTransformChangedSubscription.unsubscribe();
    }
    this.__nodeService.removeNode(this);
  }

  protected __onPositionOrScaleChange(): void {
    this._transform = createMatrixCss(this.position);
    this.__recalcInvertedWorkspaceTransform();
  }

  protected __recalcInvertedWorkspaceTransform() {
    this.__invertedWorkspaceTransform = createMatrixCss(
      [
        -this.__workspace.position[0] - this.position[0],
        -this.__workspace.position[1] - this.position[1]
      ],
      [
        1 / this.__workspace.scale[0],
        1 / this.__workspace.scale[1]
      ]
    );
  }

  public abstract createBackendNode(): BackendNode;

  /**
   * Implementation of the ContextMenuAttachDirective
   * @see https://github.com/isaacplmann/ngx-contextmenu/blob/master/projects/ngx-contextmenu/src/lib/contextMenu.attach.directive.ts
   * @param event
   */
  @HostListener('contextmenu', ['$event'])
  public onContextMenu(event: MouseEvent): void {
    if (isNotNullOrUndefined(this._nodeContextMenu)) {
      if (!this._nodeContextMenu.disabled) {
        this.__contextMenuService.show.next({
          contextMenu: this._nodeContextMenu,
          event,
          item: this.__contextMenuService,
        });
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    if (event.defaultPrevented === false) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setDragImage(this.element.nativeElement, 0, 0);
      this.__dndDataTransfer.toEvent(
        event,
        new NodeDragAndDropData(this, [event.screenX, event.screenY], this.__onDropped.bind(this))
      );
    }
  }

  protected __onDropped(data: NodeDragAndDropData) {
    this.position = [
      this.position[0] + ((data.to[0] - data.from[0]) / this.__workspace.scale[0]),
      this.position[1] + ((data.to[1] - data.from[1]) / this.__workspace.scale[1])
    ];
  }

  public remove(): void {
    this.__nodeService.removeNode(this);
  }
}
