import { computed, inject, Injectable, signal } from '@angular/core';
import { PersonalService } from '../http/personal.service';
import { CategoriesService } from '../http/categories.service';
import { FechaService } from '../utils/fecha.service';
import { ToastService } from '../utils/toast.service';
import { mensajeDeError } from '../utils/api-error';
import { gastosPorDia, ultimosRegistrados } from '../utils/actividad';
import { aplicarCambiosCategorias, CambiosCategorias, ordenarCategorias } from '../utils/categorias';
import { PesoChilenoPipe } from '../pipes/peso-chileno.pipe';
import { CategoryResponse } from '../interfaces/responses/CategoryResponse';
import { PersonalExpenseResponse, PersonalMonthTotal, PersonalSummaryResponse } from '../interfaces/responses/PersonalResponse';
import { PersonalExpenseRequest } from '../interfaces/requests/PersonalExpenseRequest';
import { DeleteScope } from '../interfaces/requests/ExpenseRequest';

export type ModalPersonal = 'gasto' | 'presupuesto' | null;

/**
 * Estado de los gastos personales del usuario: siempre variables, sin reparto, arriendo ni costos fijos. Misma
 * navegación por mes que la planilla compartida.
 */
@Injectable({
  providedIn: 'root'
})
export class PersonalStore {

  private readonly _personalService = inject(PersonalService);
  private readonly _categoriesService = inject(CategoriesService);
  private readonly _fechaService = inject(FechaService);
  private readonly _toastService = inject(ToastService);
  private readonly _pesoChileno = new PesoChilenoPipe();

  readonly categorias = signal<CategoryResponse[]>([]);
  // De la A a la Z, como se ofrecen al registrar un gasto
  readonly categoriasOrdenadas = computed(() => ordenarCategorias(this.categorias()));
  readonly mesSeleccionado = signal<string>(this._fechaService.claveMesHoy());
  readonly mesesRegistrados = signal<string[]>([]);
  readonly gastos = signal<PersonalExpenseResponse[]>([]);
  readonly resumen = signal<PersonalSummaryResponse | null>(null);
  // Total y presupuesto de los últimos meses hasta el seleccionado (gráfico de gasto mensual)
  readonly historial = signal<PersonalMonthTotal[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly modalAbierto = signal<ModalPersonal>(null);
  readonly gastoEnEdicion = signal<PersonalExpenseResponse | null>(null);

  readonly mesesDisponibles = computed(() =>
    [...new Set([...this.mesesRegistrados(), this._fechaService.claveMesHoy(), this.mesSeleccionado()])].sort()
  );

  // Presentación: gasto por día del mes y los últimos 6 gastos registrados (por cuándo se ingresaron)
  readonly gastosPorDia = computed(() =>
    gastosPorDia(this.gastos(), this.mesSeleccionado(), this._fechaService.fechaHoy()));
  readonly ultimosGastos = computed(() =>
    ultimosRegistrados(this.gastos()));

  // ---------- Carga ----------

  /** Abre la vista en `mes` (el mismo que se estaba viendo en la planilla compartida). */
  async inicializar(mes: string) {
    this.mesSeleccionado.set(mes);
    await Promise.all([this.cargarCategorias(), this.cargarMes(), this.cargarMesesRegistrados()]);
  }

  async cargarCategorias() {
    const resp = await this.ejecutar(() => this._categoriesService.obtenerCategorias());
    if (resp) this.categorias.set(resp.valor);
  }

  async cargarMesesRegistrados() {
    const resp = await this.ejecutar(() => this._personalService.obtenerMeses());
    if (resp) this.mesesRegistrados.set(resp.valor);
  }

  async cargarMes() {
    const mes = this.mesSeleccionado();
    this.cargando.set(true);
    const resp = await this.ejecutar(() => Promise.all([
      this._personalService.obtenerGastos(mes),
      this._personalService.obtenerResumen(mes),
      this._personalService.obtenerHistorial(mes)
    ]));

    // Si el usuario cambió de mes mientras cargaba, se descarta la respuesta vieja
    if (mes !== this.mesSeleccionado()) return;
    this.cargando.set(false);
    if (!resp) return;

    const [gastos, resumen, historial] = resp.valor;
    this.gastos.set(gastos.items);
    this.resumen.set(resumen);
    this.historial.set(historial);
  }

  async cambiarMes(mes: string) {
    this.mesSeleccionado.set(mes);
    await this.cargarMes();
  }

  mesAnterior() {
    return this.cambiarMes(this._fechaService.desplazarMes(this.mesSeleccionado(), -1));
  }

  mesSiguiente() {
    return this.cambiarMes(this._fechaService.desplazarMes(this.mesSeleccionado(), 1));
  }

  irAMesActual() {
    return this.cambiarMes(this._fechaService.claveMesHoy());
  }

  // ---------- Modales ----------

  abrirModalNuevoGasto() {
    this.gastoEnEdicion.set(null);
    this.modalAbierto.set('gasto');
  }

  abrirModalEditarGasto(gasto: PersonalExpenseResponse) {
    this.gastoEnEdicion.set(gasto);
    this.modalAbierto.set('gasto');
  }

  abrirModalPresupuesto() {
    this.modalAbierto.set('presupuesto');
  }

  cerrarModal() {
    this.modalAbierto.set(null);
    this.gastoEnEdicion.set(null);
  }

  // ---------- Acciones ----------

  async guardarGasto(id: string | null, request: PersonalExpenseRequest): Promise<boolean> {
    if (id) {
      const resp = await this.ejecutar(() => this._personalService.actualizarGasto(id, request));
      if (!resp) return false;
      await this.recargarTrasGuardar();
      this._toastService.mostrar('Gasto actualizado correctamente', '✓');
      return true;
    }

    const resp = await this.ejecutar(() => this._personalService.crearGasto(request));
    if (!resp) return false;
    await this.recargarTrasGuardar();

    const { amounts } = resp.valor;
    this._toastService.mostrar(amounts.length > 1
      ? `Plan de ${amounts.length} cuotas creado (${this._pesoChileno.transform(amounts[0])}/mes)`
      : 'Gasto guardado con éxito', amounts.length > 1 ? '📅' : '✓');
    return true;
  }

  async eliminarGasto(gasto: PersonalExpenseResponse, alcance: DeleteScope) {
    const resp = await this.ejecutar(() => this._personalService.eliminarGasto(gasto.id, alcance));
    if (!resp) return;

    await Promise.all([this.cargarMes(), this.cargarMesesRegistrados()]);
    this._toastService.mostrar(alcance === 'Plan' ? 'Se eliminaron las cuotas del plan' : 'Gasto eliminado', '🗑️');
  }

  /**
   * Configuración personal: aplica los cambios de categorías (compartidas con la planilla) y, si `monto` viene, el
   * presupuesto desde el mes que se ve. Si un paso falla se detiene y recarga el estado real.
   */
  async guardarConfiguracion(monto: number | null, categorias: CambiosCategorias) {
    const mes = this.mesSeleccionado();
    const resp = await this.ejecutar(async () => {
      await aplicarCambiosCategorias(this._categoriesService, this.categorias(), categorias);
      if (monto !== null) await this._personalService.actualizarPresupuesto(mes, monto);
    });

    await Promise.all([this.cargarCategorias(), this.cargarMes()]);
    if (!resp) return;

    this.cerrarModal();
    this._toastService.mostrar(monto !== null
      ? `Presupuesto de ${this._pesoChileno.transform(monto)} desde ${this._fechaService.nombreMes(mes)}`
      : 'Configuración guardada', monto !== null ? '🎯' : '⚙️');
  }

  private async recargarTrasGuardar() {
    this.cerrarModal();
    await Promise.all([this.cargarMes(), this.cargarMesesRegistrados()]);
  }

  // Devuelve { valor } si la llamada fue exitosa; si no, muestra el error de la API y devuelve null
  private async ejecutar<T>(accion: () => Promise<T>): Promise<{ valor: T } | null> {
    try {
      return { valor: await accion() };
    } catch (error) {
      this._toastService.mostrar(mensajeDeError(error), '⚠️');
      this.cargando.set(false);
      return null;
    }
  }
}
