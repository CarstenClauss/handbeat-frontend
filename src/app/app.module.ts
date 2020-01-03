import {BrowserModule} from '@angular/platform-browser';
import {ComponentFactory, ComponentFactoryResolver, NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {WorkspaceComponent} from './ui/workspace.component';
import {OscillatorNodeComponent} from './ui/nodes/oscillator-node.component';
import {NodeSocketComponent} from './ui/nodes/node-attachments/node-socket.component';
import {NodeSocketGroupComponent} from './ui/nodes/node-attachments/node-socket-group.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NodeConnectionComponent} from './ui/nodes/node-attachments/node-connection.component';
import {FilterNodeComponent} from './ui/nodes/filter-node.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AudioSinkNodeComponent} from './ui/nodes/audio-sink-node.component';
import {BackendAudioService} from './backend-audio.service';
import {ControllsComponent} from './ui/controlls.component';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faChevronDown, faChevronUp, faHandPaper, faPause, faPlay, faStop, IconDefinition} from '@fortawesome/free-solid-svg-icons';
import {PianoRollPanelComponent} from './ui/piano-roll-panel.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PianoRollComponent} from './ui/piano-roll.component';
import {NodeComponent} from './ui/nodes/node.component';
import {NodeType} from './types';
import {NodeService} from './node.service';
import {ContextMenuModule} from 'ngx-contextmenu';
import {PianoRollService} from './piano-roll.service';
import {HandControlsComponent} from './ui/hand-controls.component';
import {HandControlComponent} from './ui/hand-control.component';
import { RangePipe } from './range.pipe';
import {HandAxisControlDirective} from './ui/hand-axis-control.directive';

const icons: IconDefinition[] = [
  faPlay,
  faPause,
  faStop,
  faChevronUp,
  faChevronDown,
  faHandPaper
];

@NgModule({
  entryComponents: [
    OscillatorNodeComponent,
    FilterNodeComponent,
    AudioSinkNodeComponent,
    PianoRollComponent
  ],
  declarations: [
    AppComponent,
    WorkspaceComponent,
    OscillatorNodeComponent,
    FilterNodeComponent,
    AudioSinkNodeComponent,
    NodeSocketComponent,
    NodeSocketGroupComponent,
    NodeConnectionComponent,
    ControllsComponent,
    PianoRollPanelComponent,
    PianoRollComponent,
    HandControlsComponent,
    HandControlComponent,
    HandAxisControlDirective,
    RangePipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ContextMenuModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private _audioService: BackendAudioService,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _nodeService: NodeService,
    faIconLibrary: FaIconLibrary
  ) {
    this.__setupIcons(faIconLibrary);
    this.__setupNodeTypesToFactories();
  }

  protected __setupIcons(faIconLibrary: FaIconLibrary) {
    for (const icon of icons) {
      faIconLibrary.addIcons(icon);
    }
  }

  protected __setupNodeTypesToFactories() {
    const map = new Map<NodeType, ComponentFactory<NodeComponent>>();

    map.set(
      NodeType.AudioSink,
      this._componentFactoryResolver.resolveComponentFactory(AudioSinkNodeComponent)
    );
    map.set(
      NodeType.Filter,
      this._componentFactoryResolver.resolveComponentFactory(FilterNodeComponent)
    );
    map.set(
      NodeType.Oscillator,
      this._componentFactoryResolver.resolveComponentFactory(OscillatorNodeComponent)
    );

    this._nodeService.setupNodeTypeToFactory(map);
  }
}
