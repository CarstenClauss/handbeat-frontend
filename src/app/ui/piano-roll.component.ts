import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewContainerRef,
  ViewRef
} from '@angular/core';
import {NodeComponent} from './nodes/node.component';
import {Subscription} from 'rxjs/Subscription';
import {NodeService} from '../node.service';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {PianoRollPanelComponent} from './piano-roll-panel.component';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-piano-roll',
  templateUrl: './piano-roll.component.html',
  styleUrls: [
    './piano-roll.component.scss'
  ]
})
export class PianoRollComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public attachedNode: NodeComponent;

  @Output()
  public readonly destroy: Observable<PianoRollComponent>;
  protected __destroy = new EventEmitter<PianoRollComponent>();

  protected __nodeRemovedSubscription: Subscription;

  constructor(
    protected __nodeService: NodeService
  ) {
    this.destroy = this.__destroy.asObservable();
  }

  ngOnInit(): void {
    this.__nodeRemovedSubscription = this
      .__nodeService
      .onNodeRemoved
      .subscribe(this.__onNodeRemoved.bind(this))
    ;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('attachedNode' in changes) {
      // TODO: Update attached node
    }
  }

  ngOnDestroy(): void {
    if (isNotNullOrUndefined(this.__nodeRemovedSubscription)) {
      this.__nodeRemovedSubscription.unsubscribe();
      this.__nodeRemovedSubscription = null;
    }
  }

  protected __onNodeRemoved(node: NodeComponent) {
    if (node === this.attachedNode) {
      this.__destroy.emit(this);
    }
  }
}
