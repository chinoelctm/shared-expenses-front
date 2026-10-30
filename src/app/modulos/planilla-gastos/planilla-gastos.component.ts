import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { PlanillaStore } from '../../core/state/planilla.store';
import { SesionStore } from '../../core/state/sesion.store';
import { NombreMesPipe } from '../../core/pipes/nombre-mes.pipe';
import { GastoReciente } from '../../core/interfaces/Planilla';
import { ResumenKpiComponent } from './components/resumen-kpi/resumen-kpi.component';
import { ActividadMesComponent } from '../../shared/actividad-mes/actividad-mes.component';
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
    ActividadMesComponent,
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

  ngOnInit(): void {
    this.store.inicializar();
  }

  // La línea de tiempo devuelve el gasto que se tocó; se edita el completo del mes
  protected editarReciente(reciente: GastoReciente) {
    const gasto = this.store.gastos().find(g => g.id === reciente.id);
    if (gasto) this.store.abrirModalEditarGasto(gasto);
  }
}
