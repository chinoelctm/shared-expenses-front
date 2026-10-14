import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanillaStore } from '../../../../core/state/planilla.store';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { NombreMesPipe } from '../../../../core/pipes/nombre-mes.pipe';
import { coloresPersona } from '../../../../core/utils/persona-colores';

@Component({
  selector: 'app-modal-arriendo',
  standalone: true,
  imports: [FormsModule, PesoChilenoPipe, NombreMesPipe],
  templateUrl: './modal-arriendo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalArriendoComponent implements OnInit {

  protected readonly store = inject(PlanillaStore);
  protected readonly colores = coloresPersona;

  protected monto: number | null = 0;
  protected pagado = false;
  protected guardando = false;

  ngOnInit(): void {
    const arriendo = this.store.arriendo();
    this.monto = arriendo?.amount ?? this.store.configuracion()?.defaultRent ?? 0;
    this.pagado = !!arriendo?.paid;
  }

  protected get montoValido(): number {
    return Math.round(Number(this.monto)) || 0;
  }

  protected get reparto() {
    return this.store.previsualizarReparto(this.montoValido);
  }

  protected async guardar() {
    this.guardando = true;
    await this.store.actualizarArriendo({ amount: this.montoValido, paid: this.pagado });
    this.guardando = false;
  }
}
