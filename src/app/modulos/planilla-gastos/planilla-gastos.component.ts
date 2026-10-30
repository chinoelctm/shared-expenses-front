import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { PlanillaStore } from '../../core/state/planilla.store';
import { SesionStore } from '../../core/state/sesion.store';
import { NombreMesPipe } from '../../core/pipes/nombre-mes.pipe';
import { GastoReciente } from '../../core/interfaces/Planilla';
import { ResumenKpiComponent } from './components/resumen-kpi/resumen-kpi.component';
import { BarraMensual, GraficoMensualComponent, SegmentoMensual } from '../../shared/grafico-mensual/grafico-mensual.component';
import { UltimosGastosComponent } from '../../shared/ultimos-gastos/ultimos-gastos.component';
import { DistribucionCategoriasComponent } from '../../shared/distribucion-categorias/distribucion-categorias.component';
import { TablaGastosComponent } from './components/tabla-gastos/tabla-gastos.component';
import { ModalArriendoComponent } from './components/modal-arriendo/modal-arriendo.component';
import { ModalGastoComponent } from './components/modal-gasto/modal-gasto.component';
import { ModalConfiguracionComponent } from './components/modal-configuracion/modal-configuracion.component';

@Component({
  selector: 'app-planilla-gastos',
  standalone: true,
  imports: [
    NombreMesPipe,
    ResumenKpiComponent,
    GraficoMensualComponent,
    UltimosGastosComponent,
    DistribucionCategoriasComponent,
    TablaGastosComponent,
    ModalArriendoComponent,
    ModalGastoComponent,
    ModalConfiguracionComponent
  ],
  templateUrl: './planilla-gastos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-1 flex-col' }
})
export class PlanillaGastosComponent implements OnInit {

  protected readonly store = inject(PlanillaStore);
  private readonly _sesion = inject(SesionStore);

  // "Buenas tardes, Joaquín" según la hora del equipo
  protected readonly saludo = computed(() => {
    const hora = new Date().getHours();
    const nombre = this._sesion.usuario()?.name.split(/\s+/)[0];
    const momento = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';
    return nombre ? `${momento}, ${nombre}` : momento;
  });

  // Gasto mensual: arriendo y fijos abajo, variables arriba (las clases quedan escritas completas para Tailwind)
  protected readonly leyendaMensual: SegmentoMensual[] = [
    { monto: 0, etiqueta: 'Arriendo y fijos', clase: 'bg-slate-400/80 dark:bg-slate-500/80' },
    { monto: 0, etiqueta: 'Variables y cuotas', clase: 'bg-gradient-to-t from-indigo-500 to-sky-400' }
  ];

  protected readonly barrasMensuales = computed<BarraMensual[]>(() =>
    this.store.historial().map(h => ({
      mes: h.month,
      total: h.total,
      segmentos: [
        { ...this.leyendaMensual[0], monto: h.fixed },
        { ...this.leyendaMensual[1], monto: h.variable }
      ]
    })));

  ngOnInit(): void {
    this.store.inicializar();
  }

  // La línea de tiempo devuelve el gasto que se tocó; se edita el completo del mes
  protected editarReciente(reciente: GastoReciente) {
    const gasto = this.store.gastos().find(g => g.id === reciente.id);
    if (gasto) this.store.abrirModalEditarGasto(gasto);
  }
}
