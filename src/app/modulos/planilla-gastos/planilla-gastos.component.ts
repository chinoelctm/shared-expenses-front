import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { PlanillaStore } from '../../core/state/planilla.store';
import { SesionStore } from '../../core/state/sesion.store';
import { NombreMesPipe } from '../../core/pipes/nombre-mes.pipe';
import { ResumenKpiComponent } from './components/resumen-kpi/resumen-kpi.component';
import { ActividadMesComponent } from './components/actividad-mes/actividad-mes.component';
import { DistribucionCategoriasComponent } from './components/distribucion-categorias/distribucion-categorias.component';
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
}
