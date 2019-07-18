import { Pipe, PipeTransform } from '@angular/core';

/**
 * Get min value from list of inputted values
 */
@Pipe({
  name: 'min'
})
export class MinPipe implements PipeTransform {
  transform(value: number[], args: string[]): any {
    return Math.min.apply(null, value);
  }
}
