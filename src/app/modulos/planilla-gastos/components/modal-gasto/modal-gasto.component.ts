import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import environment from '../../../../../assets/config/config.json';
import { PlanillaStore } from '../../../../core/state/planilla.store';
import { RepartoService } from '../../../../core/utils/reparto.service';
import { FechaService } from '../../../../core/utils/fecha.service';
import { ToastService } from '../../../../core/utils/toast.service';
import { ConfirmService } from '../../../../core/utils/confirm.service';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { NombreMesPipe } from '../../../../core/pipes/nombre-mes.pipe';
import { coloresPersona } from '../../../../core/utils/persona-colores';
import { ExpenseResponse } from '../../../../core/interfaces/responses/ExpenseResponse';

const MAX_CUOTAS = 48;
const CUOTAS_POR_DEFECTO = 3;

@Component({
  selector: 'app-modal-gasto',
  standalone: true,
  imports: [FormsModule, PesoChilenoPipe, NombreMesPipe],
  templateUrl: './modal-gasto.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalGastoComponent implements OnInit {

  protected readonly store = inject(PlanillaStore);
  private readonly _repartoService = inject(RepartoService);
  private readonly _fechaService = inject(FechaService);
  private readonly _toastService = inject(ToastService);
  private readonly _confirmService = inject(ConfirmService);
  private readonly _pesoChileno = new PesoChilenoPipe();

  protected readonly cuotasRapidas: number[] = environment.ListaCuotasRapidas;
  protected readonly colores = coloresPersona;

  protected gastoOriginal: ExpenseResponse | null = null;
  protected descripcion = '';
  protected monto: number | null = null;
  protected fecha = '';
  // Por defecto, la primera categoría activa
  protected categoria = this.store.categorias()[0]?.id ?? '';
  protected pagado = false;
  // Id de quien pagó el total ('' = nadie todavía)
  protected pagadoPor = '';
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
      this.pagado = gasto.paid;
      this.pagadoPor = gasto.paidBy ?? '';
      this.cuotasHabilitadas = this.esCuotaExistente;
      this.cuotas = gasto.installment?.total ?? 1;
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

  protected get titulo(): string {
    return this.gastoOriginal ? 'Editar Gasto' : 'Registrar Nuevo Gasto';
  }

  protected get esCuotaExistente(): boolean {
    return (this.gastoOriginal?.installment?.total ?? 0) > 1;
  }

  protected get montoTotal(): number {
    return Math.round(Number(this.monto)) || 0;
  }

  protected get cuotasEfectivas(): number {
    if (this.esCuotaExistente || !this.cuotasHabilitadas) return 1;
    return Math.min(MAX_CUOTAS, Math.max(1, Math.floor(Number(this.cuotas)) || 1));
  }

  protected get planCuotas(): boolean {
    return this.cuotasEfectivas > 1;
  }

  protected get montosCuotas(): number[] {
    return this._repartoService.calcularCuotas(this.montoTotal, this.cuotasEfectivas);
  }

  protected get montoCuota(): number {
    return this.montosCuotas[0] ?? 0;
  }

  protected get reparto() {
    return this.store.previsualizarReparto(this.planCuotas ? this.montoCuota : this.montoTotal);
  }

  protected get nombrePagador(): string | null {
    return this.store.personas().find(p => p.id === this.pagadoPor)?.name ?? null;
  }

  // Lo que cada uno le debe a quien pagó (por cuota si es un plan)
  protected get deudas(): { nombre: string; monto: number }[] {
    if (!this.pagadoPor) return [];
    const personas = this.store.personas();
    return this.reparto
      .map((parte, i) => ({ id: personas[i]?.id, nombre: parte.nombre, monto: parte.monto }))
      .filter(d => d.id !== this.pagadoPor && d.monto > 0);
  }

  protected get etiquetaPagado(): string {
    if (this.nombrePagador) {
      const deudores = this.deudas.map(d => d.nombre).join(', ') || 'los demás';
      return `${deudores} ya le pagó su parte a ${this.nombrePagador}`;
    }
    return this.gastoOriginal ? 'Gasto pagado' : 'Marcar inmediatamente como pagado';
  }

  protected get etiquetaCuotas(): string {
    const cuota = this.gastoOriginal?.installment;
    if (this.esCuotaExistente && cuota) return `Cuota ${cuota.number} de ${cuota.total}`;
    return this.planCuotas ? `${this.cuotasEfectivas} cuotas` : '1 cuota';
  }

  protected get textoAyuda(): string {
    if (!this.planCuotas) return '*Redondeo asignado para calce exacto.';
    const ultima = this.montosCuotas[this.montosCuotas.length - 1];
    if (ultima !== this.montoCuota) {
      return `*Cuotas 1 a ${this.cuotasEfectivas - 1}: ${this._pesoChileno.transform(this.montoCuota)}. Última cuota: ${this._pesoChileno.transform(ultima)} por calce exacto.`;
    }
    return `*Cada mes se cargarán ${this._pesoChileno.transform(this.montoCuota)} distribuidos proporcionalmente.`;
  }

  // Mover al próximo mes: solo gastos ya guardados, pendientes y que no sean costos fijos (la API aplica la misma regla)
  protected get puedeMoverse(): boolean {
    const gasto = this.gastoOriginal;
    return !!gasto && !gasto.paid && !gasto.isFixed && !gasto.isRent;
  }

  protected get mesSiguiente(): string {
    return this._fechaService.desplazarMes(this.gastoOriginal?.month ?? this.store.mesSeleccionado(), 1);
  }

  // Se mueve el gasto guardado: si el formulario tiene cambios sin guardar, primero hay que resolverlos
  protected get hayCambios(): boolean {
    const gasto = this.gastoOriginal;
    if (!gasto) return false;
    return this.descripcion.trim() !== gasto.description
      || this.montoTotal !== gasto.amount
      || this.fecha !== gasto.date
      || this.categoria !== gasto.category
      || this.pagado !== gasto.paid
      || (this.pagadoPor || null) !== gasto.paidBy;
  }

  protected async moverAlProximoMes() {
    const gasto = this.gastoOriginal;
    if (!gasto || !this.puedeMoverse || this.hayCambios) return;

    const sufijo = '(Gasto mes anterior pendiente)';
    const nombre = gasto.description.endsWith(sufijo) ? gasto.description : `${gasto.description} ${sufijo}`;
    const respuesta = await this._confirmService.preguntar({
      titulo: '¿Mover al próximo mes?',
      mensaje: `Se quita de ${this._fechaService.nombreMes(gasto.month)} y pasa a ${this._fechaService.nombreMes(this.mesSiguiente)} como:\n"${nombre}"`,
      opciones: [
        { etiqueta: 'Cancelar', valor: 'no', estilo: 'secundario' },
        { etiqueta: 'Mover al próximo mes', valor: 'si', estilo: 'primario' }
      ]
    });
    if (respuesta !== 'si') return;

    this.guardando = true;
    await this.store.moverAlProximoMes(gasto);
    this.guardando = false;
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
      isFixed: this.gastoOriginal?.isFixed ?? false,
      paid: this.pagado,
      installments: this.cuotasEfectivas,
      paidBy: this.pagadoPor || null
    });
    this.guardando = false;
  }
}
