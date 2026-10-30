import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import environment from '../../../../../assets/config/config.json';
import { PersonalStore } from '../../../../core/state/personal.store';
import { RepartoService } from '../../../../core/utils/reparto.service';
import { FechaService } from '../../../../core/utils/fecha.service';
import { ToastService } from '../../../../core/utils/toast.service';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { PersonalExpenseResponse } from '../../../../core/interfaces/responses/PersonalResponse';

const MAX_CUOTAS = 48;
const CUOTAS_POR_DEFECTO = 3;

/** Registrar o editar un gasto personal: sin reparto, sin pagos y siempre variable. */
@Component({
  selector: 'app-modal-gasto-personal',
  standalone: true,
  imports: [FormsModule, PesoChilenoPipe],
  templateUrl: './modal-gasto-personal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalGastoPersonalComponent implements OnInit {

  protected readonly store = inject(PersonalStore);
  private readonly _repartoService = inject(RepartoService);
  private readonly _fechaService = inject(FechaService);
  private readonly _toastService = inject(ToastService);

  protected readonly cuotasRapidas: number[] = environment.ListaCuotasRapidas;

  protected gastoOriginal: PersonalExpenseResponse | null = null;
  protected descripcion = '';
  protected monto: number | null = null;
  protected fecha = '';
  protected categoria = this.store.categoriasOrdenadas()[0]?.id ?? '';
  protected cuotasHabilitadas = false;
  protected cuotas: number | null = CUOTAS_POR_DEFECTO;
  protected guardando = false;

  ngOnInit(): void {
    const gasto = this.store.gastoEnEdicion();
    if (gasto) {
      this.gastoOriginal = gasto;
      this.descripcion = gasto.description;
      this.monto = gasto.amount;
      this.fecha = gasto.date;
      this.categoria = gasto.category;
      return;
    }

    // Si se está viendo otro mes, el gasto nuevo se propone en ese mes
    const mes = this.store.mesSeleccionado();
    this.fecha = mes === this._fechaService.claveMesHoy() ? this._fechaService.fechaHoy() : `${mes}-01`;
  }

  /** Si el gasto usa una categoría eliminada, se mantiene como opción para no perderla al editar. */
  protected get categoriaEliminada(): { id: string; nombre: string } | null {
    const gasto = this.gastoOriginal;
    if (!gasto || this.store.categorias().some(c => c.id === gasto.category)) return null;
    return { id: gasto.category, nombre: `${gasto.categoryName} (eliminada)` };
  }

  protected get esCuotaExistente(): boolean {
    return (this.gastoOriginal?.installment?.total ?? 0) > 1;
  }

  protected get montoTotal(): number {
    return Math.round(Number(this.monto)) || 0;
  }

  // Las cuotas solo se eligen al crear; al editar una cuota se cambia solo esa
  protected get cuotasEfectivas(): number {
    if (this.gastoOriginal || !this.cuotasHabilitadas) return 1;
    return Math.min(MAX_CUOTAS, Math.max(1, Math.floor(Number(this.cuotas)) || 1));
  }

  protected get montoCuota(): number {
    return this._repartoService.calcularCuotas(this.montoTotal, this.cuotasEfectivas)[0] ?? 0;
  }

  protected alternarCuotas(habilitadas: boolean) {
    this.cuotasHabilitadas = habilitadas;
    if (habilitadas && (Number(this.cuotas) || 0) <= 1) this.cuotas = CUOTAS_POR_DEFECTO;
  }

  protected async guardar() {
    const descripcion = this.descripcion.trim();
    if (this.montoTotal <= 0 || !descripcion || !this.fecha) {
      this._toastService.mostrar('Por favor completa todos los campos requeridos.', '⚠️');
      return;
    }

    this.guardando = true;
    await this.store.guardarGasto(this.gastoOriginal?.id ?? null, {
      description: descripcion,
      amount: this.montoTotal,
      date: this.fecha,
      category: this.categoria,
      installments: this.cuotasEfectivas
    });
    this.guardando = false;
  }
}
