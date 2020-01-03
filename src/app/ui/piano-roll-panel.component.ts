import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewRef
} from '@angular/core';
import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons';
import {PianoRollService} from '../piano-roll.service';
import {Subscription} from 'rxjs/Subscription';
import {NodeComponent} from './nodes/node.component';
import {PianoRollComponent} from './piano-roll.component';
import {NodeService} from '../node.service';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';

@Component({
  selector: 'app-piano-roll-panel',
  templateUrl: './piano-roll-panel.component.html',
  styles: [
      `:host {
          width: 100%;
      }`
  ],
  animations: [
    trigger('openClosePianoRolls', [
      state('open', style({
        height: '25vh',
        display: 'flex'
      })),
      state('closed', style({
        height: 0,
        display: 'none'
      })),
      transition('open => closed', [
        animate('500ms ease-in-out', keyframes([
          style({
            height: '25vh',
            display: 'flex'
          }),
          style({
            height: '0.1vh',
            display: 'flex'
          })
        ]))
      ]),
      transition('closed => open', [
        style({
          height: '0.1vh',
          display: 'none'
        }),
        animate('500ms ease-in-out', keyframes([
          style({
            height: '0.1vh',
            display: 'flex'
          }),
          style({
            height: '25vh',
            display: 'flex'
          })
        ]))
      ])
    ])
  ]
})
export class PianoRollPanelComponent implements OnInit, OnDestroy {
  @Input()
  public set collapsed(collapsed: boolean) {
    this.__collapsed = collapsed;
    this.__updateCollapseExpandIcon();
  }

  public get collapsed(): boolean {
    return this.__collapsed;
  }

  protected __collapsed = true;

  protected __collapseExpandIcon = faChevronUp;
  protected __collapseExpandIconAnimationState = 'closed';

  @ViewChild(
    'pianoRolls',
    {
      static: true,
      read: ViewContainerRef
    }
  )
  protected __pianoRolls: ViewContainerRef;

  protected __managedPianoRolls = new Map<PianoRollComponent, ComponentRef<PianoRollComponent>>();
  protected __managedPianoRollSubscriptions = new Map<PianoRollComponent, Subscription>();

  protected __requestPianoRollForSubscription: Subscription;

  constructor(
    protected __pianoRollService: PianoRollService,
    protected __componentFactoryResolver: ComponentFactoryResolver
  ) {
  }

  ngOnInit(): void {
    this.__requestPianoRollForSubscription = this
      .__pianoRollService
      .onRequestPianoRollFor
      .subscribe(this.__onPianoRollRequestedFor.bind(this))
    ;
  }

  ngOnDestroy(): void {
    if (isNotNullOrUndefined(this.__requestPianoRollForSubscription)) {
      this.__requestPianoRollForSubscription.unsubscribe();
      this.__requestPianoRollForSubscription = null;
    }
  }

  protected __onPianoRollRequestedFor(node: NodeComponent) {
    const componentFactory = this.__componentFactoryResolver.resolveComponentFactory(PianoRollComponent);

    const pianoRollComponentRef: ComponentRef<PianoRollComponent> = this
      .__pianoRolls
      .createComponent(componentFactory)
    ;

    this.__managedPianoRolls.set(pianoRollComponentRef.instance, pianoRollComponentRef);

    pianoRollComponentRef.instance.attachedNode = node;
    this.__managedPianoRollSubscriptions.set(
      pianoRollComponentRef.instance,
      pianoRollComponentRef.instance.destroy.subscribe(this.__onPianoRollDelete.bind(this))
    );

    this.__pianoRollService.addPianoRollFor(node, pianoRollComponentRef.instance);
  }

  protected __onPianoRollDelete(pianoRoll: PianoRollComponent) {
    if (
      this.__managedPianoRolls.has(pianoRoll)
      && this.__pianoRolls.indexOf(this.__managedPianoRolls.get(pianoRoll).hostView) !== -1
    ) {
      this.__pianoRolls.remove(this.__pianoRolls.indexOf(this.__managedPianoRolls.get(pianoRoll).hostView));
      this.__managedPianoRolls.delete(pianoRoll);
      if (this.__managedPianoRollSubscriptions.has(pianoRoll)) {
        this.__managedPianoRollSubscriptions.get(pianoRoll).unsubscribe();
        this.__managedPianoRollSubscriptions.delete(pianoRoll);
      }
    }
  }

  protected __updateCollapseExpandIcon(): void {
    if (this.collapsed) {
      this.__collapseExpandIcon = faChevronUp;
      this.__collapseExpandIconAnimationState = 'closed';
    } else {
      this.__collapseExpandIcon = faChevronDown;
      this.__collapseExpandIconAnimationState = 'open';
    }
  }
}
