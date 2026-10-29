import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PlanillaStore } from '../../../../core/state/planilla.store';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { FechaCortaPipe } from '../../../../core/pipes/fecha-corta.pipe';
import { GastoDelDia } from '../../../../core/utils/actividad';

/** Gasto variable por día del mes y los últimos gastos registrados (solo presentación, sin lógica propia). */
@Component({
  selector: 'app-actividad-mes',
  standalone: true,
  imports: [PesoChilenoPipe, FechaCortaPipe],
  templateUrl: './actividad-mes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class ActividadMesComponent {

  protected readonly store = inject(PlanillaStore);

  protected readonly dias = this.store.gastosVariablesPorDia;
  protected readonly maximo = computed(() => Math.max(1, ...this.dias().map(d => d.monto)));
  protected readonly totalVariable = computed(() => this.dias().reduce((suma, d) => suma + d.monto, 0));
  protected readonly diaMayor = computed(() => {
    const mayor = this.dias().reduce((a, b) => (b.monto > a.monto ? b : a), this.dias()[0]);
    return mayor?.monto ? mayor : null;
  });
  private readonly diaHoy = computed(() => this.dias().find(d => d.esHoy)?.dia ?? null);

  /** Número bajo la barra: hoy, el día 1 y cada 5 días, salvo los pegados a hoy (en el teléfono se encimarían). */
  protected etiqueta(dia: GastoDelDia): string {
    if (dia.esHoy) return String(dia.dia);
    const hoy = this.diaHoy();
    const pegadoAHoy = hoy !== null && Math.abs(dia.dia - hoy) <= 1;
    return (dia.dia === 1 || dia.dia % 5 === 0) && !pegadoAHoy ? String(dia.dia) : '';
  }
}
