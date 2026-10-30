import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PersonalStore } from '../../../../core/state/personal.store';
import { ConfirmService } from '../../../../core/utils/confirm.service';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { FechaCortaPipe } from '../../../../core/pipes/fecha-corta.pipe';
import { CategoriaBadgeComponent } from '../../../../shared/categoria-badge/categoria-badge.component';
import { PersonalExpenseResponse } from '../../../../core/interfaces/responses/PersonalResponse';

@Component({
  selector: 'app-tabla-personal',
  standalone: true,
  imports: [PesoChilenoPipe, FechaCortaPipe, CategoriaBadgeComponent],
  templateUrl: './tabla-personal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablaPersonalComponent {

  protected readonly store = inject(PersonalStore);
  private readonly _confirmService = inject(ConfirmService);
  private readonly _pesoChileno = new PesoChilenoPipe();

  protected esPlanCuotas(gasto: PersonalExpenseResponse): boolean {
    return (gasto.installment?.total ?? 0) > 1;
  }

  protected async eliminar(gasto: PersonalExpenseResponse) {
    if (gasto.installment && this.esPlanCuotas(gasto)) {
      const respuesta = await this._confirmService.preguntar({
        titulo: 'Eliminar gasto en cuotas',
        mensaje: `Este gasto pertenece a un plan de ${gasto.installment.total} cuotas (${gasto.installment.number}/${gasto.installment.total}).\n¿Qué deseas eliminar?`,
        opciones: [
          { etiqueta: 'Cancelar', valor: 'cancelar', estilo: 'secundario' },
          { etiqueta: 'Solo esta cuota', valor: 'cuota', estilo: 'primario' },
          { etiqueta: 'Todo el plan', valor: 'plan', estilo: 'peligro' }
        ]
      });
      if (respuesta === 'cuota' || respuesta === 'plan') {
        await this.store.eliminarGasto(gasto, respuesta === 'plan' ? 'Plan' : 'Single');
      }
      return;
    }

    const respuesta = await this._confirmService.preguntar({
      titulo: 'Eliminar gasto',
      mensaje: `¿Eliminar el gasto "${gasto.description}" por ${this._pesoChileno.transform(gasto.amount)}?`,
      opciones: [
        { etiqueta: 'Cancelar', valor: 'cancelar', estilo: 'secundario' },
        { etiqueta: 'Eliminar', valor: 'eliminar', estilo: 'peligro' }
      ]
    });
    if (respuesta === 'eliminar') {
      await this.store.eliminarGasto(gasto, 'Single');
    }
  }
}
