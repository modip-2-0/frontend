import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'basename',
  standalone: true   // importante para standalone components
})
export class BasenamePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    // Separa por / o \ y toma el último fragmento
    const parts = value.split(/[\\/]/);
    return parts[parts.length - 1];
  }
}