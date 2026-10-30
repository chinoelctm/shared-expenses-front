import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { PesoChilenoPipe } from '../../core/pipes/peso-chileno.pipe';
import { FechaService } from '../../core/utils/fecha.service';

/** Parte de una barra (de abajo hacia arriba). El color va como clase de Tailwind escrita completa o como estilo. */
export interface SegmentoMensual {
  monto:     number;
  etiqueta:  string;
  clase?:    string;
  color?:    string;
}

export interface BarraMensual {
  mes:        string;
  total:      number;
  segmentos:  SegmentoMensual[];
  // Marca horizontal sobre la barra (ej. el presupuesto de ese mes)
  limite?:    number | null;
}

/**
 * Total gastado en los últimos meses, una barra por mes (apilada si tiene segmentos). La del mes que se está viendo
 * destaca; al tocar una barra se va a ese mes. Solo presentación: la planilla y los gastos personales le pasan sus datos.
 */
@Component({
  selector: 'app-grafico-mensual',
  standalone: true,
  imports: [PesoChilenoPipe],
  templateUrl: './grafico-mensual.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col' }
})
export class GraficoMensualComponent {

  private readonly _fechaService = inject(FechaService);
  private readonly _peso = new PesoChilenoPipe();

  readonly barras = input.required<BarraMensual[]>();
  readonly mesSeleccionado = input.required<string>();
  readonly subtitulo = input.required<string>();
  // Qué representa cada color (se muestra bajo el título)
  readonly leyenda = input<SegmentoMensual[]>([]);

  readonly seleccionar = output<string>();

  // La escala considera también la marca del límite, para que siempre quepa
  protected readonly maximo = computed(() =>
    Math.max(1, ...this.barras().map(b => Math.max(b.total, b.limite ?? 0))));

  protected readonly promedio = computed(() => {
    const conGasto = this.barras().filter(b => b.total > 0);
    return conGasto.length ? Math.round(conGasto.reduce((s, b) => s + b.total, 0) / conGasto.length) : 0;
  });

  protected alto(monto: number): number {
    return (monto / this.maximo()) * 82;
  }

  protected nombreCorto(mes: string): string {
    return this._fechaService.nombreMesCorto(mes);
  }

  protected descripcion(barra: BarraMensual): string {
    const partes = barra.segmentos.filter(s => s.monto > 0).map(s => `${s.etiqueta}: ${this._peso.transform(s.monto)}`);
    const limite = barra.limite ? ` · Presupuesto: ${this._peso.transform(barra.limite)}` : '';
    return `${this._fechaService.nombreMes(barra.mes)}: ${this._peso.transform(barra.total)}`
      + (partes.length > 1 ? ` (${partes.join(', ')})` : '') + limite;
  }

  /** Monto compacto sobre la barra: $735 mil, $1,2 M. */
  protected compacto(monto: number): string {
    if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '')} M`;
    if (monto >= 1_000) return `$${Math.round(monto / 1_000)} mil`;
    return `$${monto}`;
  }
}
