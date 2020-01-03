import {Component, ContentChild, TemplateRef} from '@angular/core';
import {NodeSocketComponent} from './node-socket.component';

@Component({
  selector: 'app-node-socket-group',
  templateUrl: 'node-socket-group.component.html',
  styleUrls: [
    'node-socket-group.component.scss'
  ]
})
export class NodeSocketGroupComponent {
  @ContentChild('sockets', {static: false})
  public sockets: TemplateRef<NodeSocketComponent>;
}
