import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import environment from '../../../assets/config/config.json';
import { PersonalStore } from '../../core/state/personal.store';
import { PlanillaStore } from '../../core/state/planilla.store';
import { NombreMesPipe } from '../../core/pipes/nombre-mes.pipe';
import { GastoReciente } from '../../core/interfaces/Planilla';
import { colorPresupuesto } from '../../core/utils/presupuesto';
import { GastoPorDiaComponent } from '../../shared/gasto-por-dia/gasto-por-dia.component';
import { UltimosGastosComponent } from '../../shared/ultimos-gastos/ultimos-gastos.component';
import { BarraMensual, GraficoMensualComponent, SegmentoMensual } from '../../shared/grafico-mensual/grafico-mensual.component';
import { DistribucionCategoriasComponent } from '../../shared/distribucion-categorias/distribucion-categorias.component';
import { AvisoPresupuestoComponent } from './components/aviso-presupuesto/aviso-presupuesto.component';
import { TablaPersonalComponent } from './components/tabla-personal/tabla-personal.component';
import { ModalGastoPersonalComponent } from './components/modal-gasto-personal/modal-gasto-personal.component';
import { ModalPresupuestoComponent } from './components/modal-presupuesto/modal-presupuesto.component';

/** Gastos personales: solo del usuario, sin reparto y siempre variables (sin arriendo ni costos fijos). */
@Component({
  selector: 'app-gastos-personales',
  standalone: true,
  imports: [
    NombreMesPipe,
    AvisoPresupuestoComponent,
    GastoPorDiaComponent,
    UltimosGastosComponent,
    GraficoMensualComponent,
    DistribucionCategoriasComponent,
    TablaPersonalComponent,
    ModalGastoPersonalComponent,
    ModalPresupuestoComponent
  ],
  templateUrl: './gastos-personales.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-1 flex-col' }
})
export class GastosPersonalesComponent implements OnInit, OnDestroy {

  protected readonly store = inject(PersonalStore);
  private readonly _planilla = inject(PlanillaStore);

  private readonly umbral: number = environment.UmbralAvisoPresupuesto;

  // Gasto mensual: cada barra toma el color del aviso según cuánto se gastó de su presupuesto
  protected readonly leyendaMensual: SegmentoMensual[] = [
    { monto: 0, etiqueta: 'Dentro del presupuesto', color: colorPresupuesto(0, this.umbral) },
    { monto: 0, etiqueta: 'Cerca del límite', color: colorPresupuesto(this.umbral, this.umbral) },
    { monto: 0, etiqueta: 'Sobre el presupuesto', color: colorPresupuesto(101, this.umbral) },
    { monto: 0, etiqueta: 'Sin presupuesto', clase: 'bg-gradient-to-t from-indigo-500 to-sky-400' }
  ];

  protected readonly barrasMensuales = computed<BarraMensual[]>(() =>
    this.store.historial().map(h => ({
      mes: h.month,
      total: h.total,
      limite: h.budget,
      segmentos: [h.budget
        ? { monto: h.total, etiqueta: 'Gastado', color: colorPresupuesto((h.total * 100) / h.budget, this.umbral) }
        : { monto: h.total, etiqueta: 'Gastado', clase: 'bg-gradient-to-t from-indigo-500 to-sky-400' }]
    })));

  // Se abre en el mes que se estaba viendo en la planilla compartida, y al volver la planilla sigue en este
  ngOnInit(): void {
    this.store.inicializar(this._planilla.mesSeleccionado());
  }

  ngOnDestroy(): void {
    this._planilla.mesSeleccionado.set(this.store.mesSeleccionado());
  }

  protected editarReciente(reciente: GastoReciente) {
    const gasto = this.store.gastos().find(g => g.id === reciente.id);
    if (gasto) this.store.abrirModalEditarGasto(gasto);
  }
}
