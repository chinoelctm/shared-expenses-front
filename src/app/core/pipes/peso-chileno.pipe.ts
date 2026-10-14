import { Pipe, PipeTransform } from '@angular/core';

const formateador = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

@Pipe({
  standalone: true,
  name: 'pesoChileno',
})
export class PesoChilenoPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const numero = typeof value === 'number' ? value : parseFloat(value ?? '');
    return formateador.format(Math.round(numero) || 0);
  }
}
