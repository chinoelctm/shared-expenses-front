import { ChangeDetectionStrategy, Component, inject, OnInit, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import environment from '../../../../../assets/config/config.json';
import { PersonalStore } from '../../../../core/state/personal.store';
import { ToastService } from '../../../../core/utils/toast.service';
import { NombreMesPipe } from '../../../../core/pipes/nombre-mes.pipe';
import { EditorCategoriasComponent } from '../../../../shared/editor-categorias/editor-categorias.component';

/**
 * Configuración de los gastos personales: cuánto se quiere gastar al mes (rige desde el mes visto y en los siguientes)
 * y las categorías, que son las mismas de la planilla compartida.
 */
@Component({
  selector: 'app-modal-presupuesto',
  standalone: true,
  imports: [FormsModule, NombreMesPipe, EditorCategoriasComponent],
  templateUrl: './modal-presupuesto.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalPresupuestoComponent implements OnInit {

  protected readonly store = inject(PersonalStore);
  private readonly _toastService = inject(ToastService);
  private readonly editorCategorias = viewChild.required(EditorCategoriasComponent);

  protected readonly umbral: number = environment.UmbralAvisoPresupuesto;
  protected monto: number | null = null;
  protected guardando = false;

  private montoOriginal: number | null = null;

  ngOnInit(): void {
    this.montoOriginal = this.store.resumen()?.budget?.amount ?? null;
    this.monto = this.montoOriginal;
  }

  protected async guardar() {
    const monto = Math.round(Number(this.monto)) || 0;
    // Sin presupuesto configurado se puede guardar solo las categorías; uno ya configurado no se puede dejar en $0
    if (monto <= 0 && this.montoOriginal !== null) {
      this._toastService.mostrar('Ingresa un presupuesto mayor a $0.', '⚠️');
      return;
    }
    const errorCategorias = this.editorCategorias().error();
    if (errorCategorias) {
      this._toastService.mostrar(errorCategorias, '⚠️');
      return;
    }

    this.guardando = true;
    // El presupuesto solo se guarda si cambió: así no se fija en este mes uno heredado de un mes anterior
    await this.store.guardarConfiguracion(monto > 0 && monto !== this.montoOriginal ? monto : null,
      this.editorCategorias().cambios());
    this.guardando = false;
  }
}
