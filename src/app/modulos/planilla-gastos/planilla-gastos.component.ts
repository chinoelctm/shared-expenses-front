import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { PlanillaStore } from '../../core/state/planilla.store';
import { ResumenKpiComponent } from './components/resumen-kpi/resumen-kpi.component';
import { DistribucionCategoriasComponent } from './components/distribucion-categorias/distribucion-categorias.component';
import { TablaGastosComponent } from './components/tabla-gastos/tabla-gastos.component';
import { ModalArriendoComponent } from './components/modal-arriendo/modal-arriendo.component';
import { ModalGastoComponent } from './components/modal-gasto/modal-gasto.component';
import { ModalConfiguracionComponent } from './components/modal-configuracion/modal-configuracion.component';

@Component({
  selector: 'app-planilla-gastos',
  standalone: true,
  imports: [
    ResumenKpiComponent,
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

  ngOnInit(): void {
    this.store.inicializar();
  }
}
