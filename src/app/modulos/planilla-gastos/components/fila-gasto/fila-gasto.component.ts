import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { PlanillaStore } from '../../../../core/state/planilla.store';
import { ConfirmService } from '../../../../core/utils/confirm.service';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { CategoriaBadgeComponent } from '../../../../shared/categoria-badge/categoria-badge.component';
import { FechaCortaPipe } from '../../../../core/pipes/fecha-corta.pipe';
import { ExpenseResponse } from '../../../../core/interfaces/responses/ExpenseResponse';
import { coloresPersona } from '../../../../core/utils/persona-colores';

@Component({
  selector: 'tr[app-fila-gasto]',
  standalone: true,
  imports: [PesoChilenoPipe, CategoriaBadgeComponent, FechaCortaPipe],
  templateUrl: './fila-gasto.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'claseFila' }
})
export class FilaGastoComponent {

  @Input({ required: true }) gasto!: ExpenseResponse;

  protected readonly store = inject(PlanillaStore);
  protected readonly colores = coloresPersona;
  private readonly _confirmService = inject(ConfirmService);
  private readonly _pesoChileno = new PesoChilenoPipe();

  // El reparto lo calcula la API; aquí solo se ordena según las columnas de personas
  protected get partesPorPersona() {
    return this.store.partesPorPersona(this.gasto);
  }

  protected get deudores(): string {
    return this.store.nombresDeudores(this.gasto);
  }

  protected get etiquetaEstado(): string {
    if (this.gasto.paidBy) {
      return this.gasto.paid ? '✓ Saldado' : `○ Debe ${this.deudores}`;
    }
    return this.gasto.paid ? '✓ Pagado' : '○ Pendiente';
  }

  protected get tituloEstado(): string {
    if (this.gasto.paidBy) {
      return this.gasto.paid
        ? `Marcar la parte de ${this.deudores} como pendiente`
        : `Marcar que ${this.deudores} le pagó su parte a ${this.gasto.paidByName ?? 'quien pagó'}`;
    }
    return this.gasto.paid ? 'Marcar como pendiente' : 'Marcar como pagado';
  }

  protected get esPlanCuotas(): boolean {
    return (this.gasto.installment?.total ?? 0) > 1;
  }

  protected get claseFila(): string {
    return 'transition-colors hover:bg-blue-50/40 dark:hover:bg-slate-700/40 ' + (this.gasto.paid
      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-500 dark:text-slate-400'
      : 'text-slate-800 dark:text-slate-100');
  }

  protected async eliminar() {
    const gasto = this.gasto;

    if (gasto.installment && this.esPlanCuotas) {
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
