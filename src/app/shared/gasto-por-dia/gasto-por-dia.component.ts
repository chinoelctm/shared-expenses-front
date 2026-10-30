import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PesoChilenoPipe } from '../../core/pipes/peso-chileno.pipe';
import { FechaCortaPipe } from '../../core/pipes/fecha-corta.pipe';
import { GastoDelDia } from '../../core/utils/actividad';

/** Gasto de cada día del mes con la barra de hoy destacada. Solo presentación. */
@Component({
  selector: 'app-gasto-por-dia',
  standalone: true,
  imports: [PesoChilenoPipe, FechaCortaPipe],
  templateUrl: './gasto-por-dia.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col' }
})
export class GastoPorDiaComponent {

  readonly dias = input.required<GastoDelDia[]>();
  // Qué gastos entran en el gráfico (se muestra bajo el título)
  readonly subtitulo = input.required<string>();

  protected readonly maximo = computed(() => Math.max(1, ...this.dias().map(d => d.monto)));
  protected readonly totalDias = computed(() => this.dias().reduce((suma, d) => suma + d.monto, 0));
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
