import {ComponentFactory, ComponentFactoryResolver, EventEmitter, Injectable} from '@angular/core';
import {NodeComponent} from './ui/nodes/node.component';
import {NodeType, SimpleNodeConnection} from './types';
import {Observable} from 'rxjs/Observable';
import {AudioSinkNodeComponent} from './ui/nodes/audio-sink-node.component';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  public get nodes(): ReadonlyArray<NodeComponent> {
    return this._nodes;
  }

  private _nodes: NodeComponent[] = [];

  public get onNodesChanged(): Observable<ReadonlyArray<NodeComponent>> {
    return this._nodesChanged.asObservable();
  }

  private _nodesChanged = new EventEmitter<ReadonlyArray<NodeComponent>>();

  public get onNodeAdded(): Observable<NodeComponent> {
    return this._nodeAdded.asObservable();
  }

  private _nodeAdded = new EventEmitter<NodeComponent>();

  public get onNodeRemoved(): Observable<NodeComponent> {
    return this._nodeRemoved.asObservable();
  }

  private _nodeRemoved = new EventEmitter<NodeComponent>();

  public get nodeConnections(): ReadonlySet<SimpleNodeConnection> {
    return this._nodeConnections;
  }

  private _nodeConnections = new Set<SimpleNodeConnection>();

  public get onNodeConnectionsChanged(): Observable<ReadonlySet<SimpleNodeConnection>> {
    return this._nodeConnectionsChanged.asObservable();
  }

  private _nodeConnectionsChanged = new EventEmitter<ReadonlySet<SimpleNodeConnection>>();

  public get onNodeConnectionAdded(): Observable<SimpleNodeConnection> {
    return this._nodeConnectionAdded.asObservable();
  }

  private _nodeConnectionAdded = new EventEmitter<SimpleNodeConnection>();

  public get onNodeConnectionRemoved(): Observable<SimpleNodeConnection> {
    return this._nodeConnectionRemoved.asObservable();
  }

  private _nodeConnectionRemoved = new EventEmitter<SimpleNodeConnection>();

  public get nodeTypeToFactory(): ReadonlyMap<NodeType, ComponentFactory<NodeComponent>> {
    return this._nodeTypeToFactory;
  }

  private _nodeTypeToFactory = new Map<NodeType, ComponentFactory<NodeComponent>>();

  public clearNodes() {
    const removedNodes = this._nodes;
    this._nodes = [];

    for (const removedNode of removedNodes) {
      this._nodeRemoved.emit(removedNode);
    }
  }

  public removeNode(node: NodeComponent) {
    if (this._nodes.includes(node)) {
      this._nodes.splice(this._nodes.indexOf(node), 1);
      const toRemove = [];
      for (const connection of this._nodeConnections) {
        if (connection.from.owner === node || connection.to.owner === node) {
          toRemove.push(connection);
        }
      }

      for (const connection of toRemove) {
        this.removeConnection(connection);
      }

      this._nodeRemoved.emit(node);
      this._nodesChanged.emit(this.nodes);
    }
  }

  public addNode(node: NodeComponent) {
    this._nodes.push(node);
    this._nodeAdded.emit(node);
    this._nodesChanged.emit(this.nodes);
  }

  public addNodes(nodes: NodeComponent[]) {
    this._nodes = this._nodes.concat(nodes);
    for (const node of nodes) {
      this._nodeAdded.emit(node);
    }
    this._nodesChanged.emit(this.nodes);
  }

  public getNodeFromElement(element: any): NodeComponent {
    this._nodes.find(item => {
      return item.element.nativeElement === element;
    });
    return this._nodes.find(item => item.element.nativeElement === element);
  }

  public addConnection(connection: SimpleNodeConnection): void {
    this._nodeConnections.add(connection);
    this._nodeConnectionAdded.emit(connection);
    this._nodeConnectionsChanged.emit(this.nodeConnections);
  }

  public hasConnection(connection: SimpleNodeConnection): boolean {
    return this._nodeConnections.has(connection);
  }

  public removeConnection(connection: SimpleNodeConnection): void {
    this._nodeConnections.delete(connection);
    this._nodeConnectionRemoved.emit(connection);
    this._nodeConnectionsChanged.emit(this.nodeConnections);
  }

  public setupNodeTypeToFactory(nodeTypeToFactory: Map<NodeType, ComponentFactory<NodeComponent>>) {
    this._nodeTypeToFactory = nodeTypeToFactory;
  }
}
