import { Pipe, PipeTransform } from '@angular/core';

// '2026-10-05' => '05/10'
@Pipe({
  standalone: true,
  name: 'fechaCorta',
})
export class FechaCortaPipe implements PipeTransform {
  transform(fecha: string | null | undefined): string {
    const partes = (fecha ?? '').split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}` : '-';
  }
}
