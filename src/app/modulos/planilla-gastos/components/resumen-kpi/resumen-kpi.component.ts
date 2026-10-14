import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlanillaStore } from '../../../../core/state/planilla.store';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { coloresPersona } from '../../../../core/utils/persona-colores';

@Component({
  selector: 'app-resumen-kpi',
  standalone: true,
  imports: [PesoChilenoPipe],
  templateUrl: './resumen-kpi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResumenKpiComponent {

  protected readonly store = inject(PlanillaStore);
  protected readonly resumen = this.store.resumen;
  protected readonly colores = coloresPersona;
}
