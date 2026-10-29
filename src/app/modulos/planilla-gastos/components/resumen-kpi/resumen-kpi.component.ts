import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PlanillaStore } from '../../../../core/state/planilla.store';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { coloresPersona } from '../../../../core/utils/persona-colores';
import { acumulado } from '../../../../core/utils/actividad';
import { MinigraficoComponent } from '../../../../shared/minigrafico/minigrafico.component';

@Component({
  selector: 'app-resumen-kpi',
  standalone: true,
  imports: [PesoChilenoPipe, MinigraficoComponent],
  templateUrl: './resumen-kpi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResumenKpiComponent {

  protected readonly store = inject(PlanillaStore);
  protected readonly resumen = this.store.resumen;
  protected readonly colores = coloresPersona;

  protected readonly serieAcumulada = computed(() => acumulado(this.store.gastosVariablesPorDia()));

  protected porcentajePagado(pagado: number, total: number): number {
    return total > 0 ? Math.min(100, (pagado / total) * 100) : 0;
  }
}
