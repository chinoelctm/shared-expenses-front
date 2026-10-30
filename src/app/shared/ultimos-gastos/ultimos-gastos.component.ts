import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PesoChilenoPipe } from '../../core/pipes/peso-chileno.pipe';
import { FechaCortaPipe } from '../../core/pipes/fecha-corta.pipe';
import { GastoReciente } from '../../core/interfaces/Planilla';

/** Los últimos gastos del mes como línea de tiempo (compartidos o personales). Solo presentación. */
@Component({
  selector: 'app-ultimos-gastos',
  standalone: true,
  imports: [PesoChilenoPipe, FechaCortaPipe],
  templateUrl: './ultimos-gastos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col' }
})
export class UltimosGastosComponent {

  readonly ultimos = input.required<GastoReciente[]>();
  // Posición del primer elemento en la cascada de entrada de la página
  readonly indice = input(8);

  readonly editar = output<GastoReciente>();
  readonly nuevo = output<void>();
}
