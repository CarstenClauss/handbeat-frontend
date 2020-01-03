import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {BackendService} from './backend.service';
import {Subscription} from 'rxjs/Subscription';
import {DetectedHands, NodeType} from './types';
import {ContextMenuComponent} from 'ngx-contextmenu';
import {WorkspaceComponent} from './ui/workspace.component';
import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [
      `:host {
          display: block;
          height: 100vh;
          width: 100vw;
      }`, `.foreground {
          z-index: 1;
      }`
  ],
  animations: [
    trigger('handControls', [
      transition(':leave', [
        animate('300ms ease-in-out', keyframes([
          style({
            opacity: 1
          }),
          style({
            opacity: 0
          })
        ]))
      ]),
      transition(':enter', [
        animate('300ms ease-in-out', keyframes([
          style({
            opacity: 0
          }),
          style({
            opacity: 1
          })
        ]))
      ])
    ])
  ]
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('webcamCanvas', {static: false})
  private _webcamCanvas!: ElementRef;

  @ViewChild(
    'workspace',
    {
      static: false,
      read: WorkspaceComponent
    }
  )
  private _workspace: WorkspaceComponent;

  @ViewChild(ContextMenuComponent, {static: true})
  private _contextMenu: ContextMenuComponent;

  private _webcamCtx: CanvasRenderingContext2D;
  private _videoSettings: MediaTrackSettings;

  private _capture: ImageCapture;

  private _onPoseSubscription: Subscription = null;

  private _addableNodeTypes = [
    {
      name: 'Oscillator',
      nodeType: NodeType.Oscillator
    },
    {
      name: 'Filter',
      nodeType: NodeType.Filter
    },
    {
      name: 'Audio Sink',
      nodeType: NodeType.AudioSink
    }
  ];

  public showHandControls = false;

  constructor(private _backend: BackendService) {

  }

  ngAfterViewInit(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video: true}).then((stream: MediaStream) => {
        const videoTracks: MediaStreamTrack[] = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          this._capture = new ImageCapture(videoTracks[0]);
          if (this._webcamCanvas != null && this._webcamCanvas.nativeElement instanceof HTMLCanvasElement) {
            this._videoSettings = videoTracks[0].getSettings();
            if (this._videoSettings.width !== null && this._videoSettings.height !== null) {
              this._webcamCanvas.nativeElement.width = this._videoSettings.width;
              this._webcamCanvas.nativeElement.height = this._videoSettings.height;
              this._onPoseSubscription = this._backend.onpose.subscribe((results: [DetectedHands, DetectedHands]) => {
                this.sendFrame();
              });
            }
            this._webcamCtx = this._webcamCanvas.nativeElement.getContext('2d');
          }
        } else {
          throw new Error('Unable to initialize capture due to missing video track');

        }
        this.connectBackend();
      }).catch((reason: any) => {
        console.log(reason);
        throw new Error('Unable to initialize WebCam');
      });
    }
  }

  ngOnDestroy(): void {
    if (this._onPoseSubscription != null) {
      this._onPoseSubscription.unsubscribe();
    }
  }

  sendFrame(): void {
    this._capture.grabFrame().then((image: ImageBitmap) => {
      this._webcamCtx.drawImage(image, 0, 0, this._webcamCanvas.nativeElement.width, this._webcamCanvas.nativeElement.height);
      this._backend.sendFrame(
        this._webcamCtx.getImageData(
          0,
          0,
          this._webcamCanvas.nativeElement.width,
          this._webcamCanvas.nativeElement.height
        )
      );
    }).catch(() => {
      requestAnimationFrame(this.sendFrame.bind(this));
    });
  }

  connectBackend(): void {
    if (false === this._backend.connected) {
      this._backend.tryConnect(this._webcamCanvas.nativeElement.width, this._webcamCanvas.nativeElement.height).then(() => {
        this._backend.connected = true;
        this.sendFrame();
      }).catch(() => {
        setTimeout(() => this.connectBackend(), 1000);
      });
    } else {
      this.sendFrame();
    }
  }

  addNode(event: Event, nodeType: NodeType) {
    // TODO: find position of the context menu and use it instead of mouse position
    const mouseEvent = (<MouseEvent>event);
    this._workspace.addNode(
      [mouseEvent.clientX, mouseEvent.clientY],
      nodeType
    );
  }
}
