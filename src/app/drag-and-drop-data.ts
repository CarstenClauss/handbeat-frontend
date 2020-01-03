import {NodeComponent} from './ui/nodes/node.component';
import {NodeSocketComponent} from './ui/nodes/node-attachments/node-socket.component';
import {Hand, Axis, NodeSocketDirection} from './types';

export abstract class DragAndDropData {
  public readonly type: string;
}

export function isDragAndDropData(val: any): val is DragAndDropData {
  return (<DragAndDropData>val).type !== undefined;
}

export const NodeDragAndDropDataType = 'node';

export class NodeDragAndDropData extends DragAndDropData {
  public readonly type = NodeDragAndDropDataType;
  public action: string;
  public node: NodeComponent;
  public ondropped: (data: NodeDragAndDropData) => void;
  public from: [number, number];
  public to: [number, number] = null;

  constructor(node: NodeComponent, from: [number, number], ondropped: (data: NodeDragAndDropData) => void, action: string = 'move') {
    super();
    this.node = node;
    this.from = from;
    this.ondropped = ondropped;
    this.action = action;
  }
}

export function isNodeDragAndDropData(val: any): val is NodeDragAndDropData {
  return isDragAndDropData(val)
    && (<NodeDragAndDropData>val).type === NodeDragAndDropDataType
    && (<NodeDragAndDropData>val).action !== undefined
    && (<NodeDragAndDropData>val).node !== undefined
    && (<NodeDragAndDropData>val).from !== undefined
    ;
}

export const SocketDragAndDropDataType = 'socket';

export class SocketDragAndDropData extends DragAndDropData {
  public readonly type = SocketDragAndDropDataType;
  public socket: NodeSocketComponent;
  public direction: NodeSocketDirection;

  constructor(
    socket: NodeSocketComponent,
    socketType: NodeSocketDirection = NodeSocketDirection.Both
  ) {
    super();
    this.socket = socket;
    this.direction = socketType;
  }

}

export function isSocketDragAndDropData(val: any): val is SocketDragAndDropData {
  return isDragAndDropData(val)
    && (<SocketDragAndDropData>val).type === SocketDragAndDropDataType
    && (<SocketDragAndDropData>val).socket !== undefined
    && (<SocketDragAndDropData>val).direction !== undefined
    ;
}

export const HandAxisDragAndDropDataType = 'hand-axis';

export class HandAxisDragAndDropData extends DragAndDropData {
  public readonly type = HandAxisDragAndDropDataType;
  public hand: Hand;
  public axis: Axis;

  constructor(
    hand: Hand,
    axis: Axis
  ) {
    super();
    this.hand = hand;
    this.axis = axis;
  }

}

export function isHandAxisDragAndDropData(val: any): val is HandAxisDragAndDropData {
  return isDragAndDropData(val)
    && (<HandAxisDragAndDropData>val).type === HandAxisDragAndDropDataType
    && (<HandAxisDragAndDropData>val).hand !== undefined
    && (<HandAxisDragAndDropData>val).axis !== undefined
    ;
}
