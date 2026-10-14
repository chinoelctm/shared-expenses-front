import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PlanillaStore } from '../../../../core/state/planilla.store';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { FiltroGasto } from '../../../../core/interfaces/Planilla';
import { PersonSummary } from '../../../../core/interfaces/responses/MonthSummaryResponse';
import { coloresPersona } from '../../../../core/utils/persona-colores';
import { FilaGastoComponent } from '../fila-gasto/fila-gasto.component';

@Component({
  selector: 'app-tabla-gastos',
  standalone: true,
  imports: [PesoChilenoPipe, FilaGastoComponent],
  templateUrl: './tabla-gastos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablaGastosComponent {

  protected readonly store = inject(PlanillaStore);
  protected readonly resumen = this.store.resumen;
  protected readonly colores = coloresPersona;

  // Descripción, Categoría, Fecha, Monto, Estado, Acciones + una columna por persona
  protected readonly totalColumnas = computed(() => 6 + this.store.personas().length);

  // Totales por persona del resumen, alineados con el orden de las columnas
  protected readonly totalesPorPersona = computed<(PersonSummary | null)[]>(() => {
    const porId = new Map((this.resumen()?.people ?? []).map(p => [p.personId, p]));
    return this.store.personas().map(p => porId.get(p.id) ?? null);
  });

  protected readonly filtros: { valor: FiltroGasto; etiqueta: string }[] = [
    { valor: 'all', etiqueta: 'Todos' },
    { valor: 'pending', etiqueta: 'Pendientes' },
    { valor: 'paid', etiqueta: 'Pagados' }
  ];
}
