import { inject, Pipe, PipeTransform } from '@angular/core';
import { FechaService } from '../utils/fecha.service';

@Pipe({
  standalone: true,
  name: 'nombreMes',
})
export class NombreMesPipe implements PipeTransform {
  private readonly _fechaService = inject(FechaService);

  transform(mes: string): string {
    return this._fechaService.nombreMes(mes);
  }
}
