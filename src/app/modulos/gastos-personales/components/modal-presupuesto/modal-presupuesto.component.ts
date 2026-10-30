import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import environment from '../../../../../assets/config/config.json';
import { PersonalStore } from '../../../../core/state/personal.store';
import { ToastService } from '../../../../core/utils/toast.service';
import { NombreMesPipe } from '../../../../core/pipes/nombre-mes.pipe';

/** Cuánto se quiere gastar al mes en gastos personales; rige desde el mes visto y en los siguientes. */
@Component({
  selector: 'app-modal-presupuesto',
  standalone: true,
  imports: [FormsModule, NombreMesPipe],
  templateUrl: './modal-presupuesto.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalPresupuestoComponent implements OnInit {

  protected readonly store = inject(PersonalStore);
  private readonly _toastService = inject(ToastService);

  protected readonly umbral: number = environment.UmbralAvisoPresupuesto;
  protected monto: number | null = null;
  protected guardando = false;

  ngOnInit(): void {
    this.monto = this.store.resumen()?.budget?.amount ?? null;
  }

  protected async guardar() {
    const monto = Math.round(Number(this.monto)) || 0;
    if (monto <= 0) {
      this._toastService.mostrar('Ingresa un presupuesto mayor a $0.', '⚠️');
      return;
    }

    this.guardando = true;
    await this.store.guardarPresupuesto(monto);
    this.guardando = false;
  }
}
