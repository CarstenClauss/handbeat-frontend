import {NodeSocketComponent} from './ui/nodes/node-attachments/node-socket.component';
import {NodeComponent} from './ui/nodes/node.component';
import {PianoRollComponent} from './ui/piano-roll.component';

export enum NodeSocketDirection {
  In = 'in',
  Out = 'out',
  Both = 'both'
}

export enum NodeType {
  Oscillator,
  Filter,
  AudioSink
}

export enum Axis {
  x = 'x',
  y = 'y'
}

export enum Hand {
  Left = 'left',
  Right = 'right'
}

export class HandAxis {
  public hand: Hand;
  public axis: Axis;
}

export class Vector2 {
  public x: number;
  public y: number;
}

export class DetectedHands {
  public left: Vector2 | null;
  public right: Vector2 | null;
}

export class SimpleNodeConnection {
  public from: NodeSocketComponent;
  public to: NodeSocketComponent;
}

export class Rect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
}

export class NodePianoRoll {
  public node: NodeComponent;
  public pianoRoll: PianoRollComponent;
}
