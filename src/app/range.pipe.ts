import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'range'
})
export class RangePipe implements PipeTransform {

  transform(stop: number, ...args: any[]): any {
    const numbers = [];

    for (let i = 0; i < stop; i++) {
      numbers.push(i);
    }

    return numbers;
  }

}
