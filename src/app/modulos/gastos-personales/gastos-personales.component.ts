import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PersonalStore } from '../../core/state/personal.store';
import { PlanillaStore } from '../../core/state/planilla.store';
import { NombreMesPipe } from '../../core/pipes/nombre-mes.pipe';
import { GastoReciente } from '../../core/interfaces/Planilla';
import { ActividadMesComponent } from '../../shared/actividad-mes/actividad-mes.component';
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
    ActividadMesComponent,
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
