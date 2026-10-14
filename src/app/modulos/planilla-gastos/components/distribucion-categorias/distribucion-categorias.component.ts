import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { ArcElement, Chart, DoughnutController, Tooltip } from 'chart.js';
import { PlanillaStore } from '../../../../core/state/planilla.store';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { CategoriaResumen } from '../../../../core/interfaces/Planilla';

Chart.register(DoughnutController, ArcElement, Tooltip);

@Component({
  selector: 'app-distribucion-categorias',
  standalone: true,
  imports: [PesoChilenoPipe],
  templateUrl: './distribucion-categorias.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistribucionCategoriasComponent implements AfterViewInit, OnDestroy {

  @ViewChild('grafico') private readonly canvas!: ElementRef<HTMLCanvasElement>;

  protected readonly store = inject(PlanillaStore);

  // Montos, porcentajes y colores (los configurados por categoría) vienen de la API
  protected readonly categorias = computed<CategoriaResumen[]>(() =>
    (this.store.resumen()?.categories ?? []).map(c => ({
      nombre: c.name,
      monto: c.amount,
      porcentaje: c.percentage,
      color: c.color
    }))
  );

  private readonly _pesoChileno = new PesoChilenoPipe();
  private readonly vistaLista = signal(false);
  private grafico: Chart<'doughnut'> | null = null;

  constructor() {
    effect(() => {
      const categorias = this.categorias();
      if (this.vistaLista()) this.renderizarGrafico(categorias);
    });
  }

  ngAfterViewInit(): void {
    this.vistaLista.set(true);
  }

  private renderizarGrafico(categorias: CategoriaResumen[]) {
    const hayDatos = categorias.length > 0;
    const modoOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.grafico?.destroy();
    this.grafico = new Chart(this.canvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: hayDatos ? categorias.map(c => c.nombre) : ['Sin gastos'],
        datasets: [{
          data: hayDatos ? categorias.map(c => c.monto) : [1],
          backgroundColor: hayDatos ? categorias.map(c => c.color) : ['#cbd5e1'],
          borderWidth: 2,
          borderColor: modoOscuro ? '#1e293b' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          tooltip: {
            enabled: hayDatos,
            callbacks: { label: (item) => ` ${this._pesoChileno.transform(item.raw as number)}` }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.grafico?.destroy();
  }
}
