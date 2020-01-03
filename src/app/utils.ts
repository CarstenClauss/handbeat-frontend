import {String} from 'typescript-string-operations';
import {Rect} from './types';
import {environment} from '../environments/environment';

export function createMatrixCss(position: [number, number], scale: [number, number] = [1, 1]): string {
  return String.Format(
    'matrix({0}, 0, 0, {1}, {2}, {3})',
    scale[0],
    scale[1],
    position[0],
    position[1]
  );
}

export function note2freq(note: number) {
  return 440 * (2 ** ((note - 69) / 12));
}

export function calcBoundingBox(points: [number, number][]): Rect {
  const min = [null, null];
  const max = [null, null];
  points.forEach(function (point) {
    if (min[0] == null || point[0] < min[0]) {
      min[0] = point[0];
    }
    if (max[0] == null || point[0] > max[0]) {
      max[0] = point[0];
    }
    if (min[1] == null || point[1] < min[1]) {
      min[1] = point[1];
    }
    if (max[1] == null || point[1] > max[1]) {
      max[1] = point[1];
    }
  });

  return {
    x: min[0],
    y: min[1],
    width: max[0] - min[0],
    height: max[1] - min[1]
  };
}

export function checkBitFlag(mask, flag) {
  // tslint:disable-next-line:no-bitwise
  return (mask & flag) === flag;
}
