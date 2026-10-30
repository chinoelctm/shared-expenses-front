import { computed, inject, Injectable, signal } from '@angular/core';
import environment from '../../../assets/config/config.json';
import { PeopleService } from '../http/people.service';
import { SettingsService } from '../http/settings.service';
import { CategoriesService } from '../http/categories.service';
import { MonthsService } from '../http/months.service';
import { ExpensesService } from '../http/expenses.service';
import { BackupService } from '../http/backup.service';
import { FechaService } from '../utils/fecha.service';
import { gastosPorDia, ultimosRegistrados } from '../utils/actividad';
import { aplicarCambiosCategorias, CambiosCategorias, ordenarCategorias } from '../utils/categorias';
import { RepartoService } from '../utils/reparto.service';
import { ToastService } from '../utils/toast.service';
import { mensajeDeError } from '../utils/api-error';
import { PesoChilenoPipe } from '../pipes/peso-chileno.pipe';
import { PersonAmount, PersonResponse } from '../interfaces/responses/PersonResponse';
import { SettingsResponse } from '../interfaces/responses/SettingsResponse';
import { CategoryResponse } from '../interfaces/responses/CategoryResponse';
import { ExpenseResponse } from '../interfaces/responses/ExpenseResponse';
import { MonthSummaryResponse, MonthTotal } from '../interfaces/responses/MonthSummaryResponse';
import { DeleteScope, ExpenseRequest } from '../interfaces/requests/ExpenseRequest';
import { SettingsRequest } from '../interfaces/requests/SettingsRequest';
import { RentRequest } from '../interfaces/requests/RentRequest';
import { FiltroGasto, ModalPlanilla } from '../interfaces/Planilla';

export interface PersonaEditada {
  id:           string | null;
  name:         string;
  contribution: number;
}

export interface RepartoPrevio {
  nombre:     string;
  porcentaje: number;
  monto:      number;
}

export interface CambiosConfiguracion {
  personas:          PersonaEditada[];
  personasBorradas:  string[];
  categorias:        CambiosCategorias;
  configuracion:     SettingsRequest;
  arriendoMes:       RentRequest | null;
}

/**
 * Estado de la planilla del mes seleccionado. Los cálculos (repartos, totales, cuotas)
 * los hace la API; aquí solo se cargan, se exponen como signals y se disparan acciones.
 */
@Injectable({
  providedIn: 'root'
})
export class PlanillaStore {

  private readonly _peopleService = inject(PeopleService);
  private readonly _settingsService = inject(SettingsService);
  private readonly _categoriesService = inject(CategoriesService);
  private readonly _monthsService = inject(MonthsService);
  private readonly _expensesService = inject(ExpensesService);
  private readonly _backupService = inject(BackupService);
  private readonly _fechaService = inject(FechaService);
  private readonly _repartoService = inject(RepartoService);
  private readonly _toastService = inject(ToastService);
  private readonly _pesoChileno = new PesoChilenoPipe();

  readonly personas = signal<PersonResponse[]>([]);
  readonly configuracion = signal<SettingsResponse | null>(null);
  readonly categorias = signal<CategoryResponse[]>([]);
  // De la A a la Z, como se ofrecen al registrar un gasto
  readonly categoriasOrdenadas = computed(() => ordenarCategorias(this.categorias()));
  readonly mesSeleccionado = signal<string>(environment.MesInicial);
  readonly gastos = signal<ExpenseResponse[]>([]);
  readonly resumen = signal<MonthSummaryResponse | null>(null);
  // Total de los últimos meses hasta el seleccionado (gráfico de gasto mensual)
  readonly historial = signal<MonthTotal[]>([]);
  readonly mesesRegistrados = signal<string[]>([]);
  readonly filtro = signal<FiltroGasto>('all');
  readonly cargando = signal<boolean>(false);
  readonly modalAbierto = signal<ModalPlanilla>(null);
  readonly gastoEnEdicion = signal<ExpenseResponse | null>(null);

  readonly arriendo = computed(() => this.gastos().find(g => g.isRent) ?? null);

  readonly mesesDisponibles = computed(() =>
    [...new Set([...this.mesesRegistrados(), this._fechaService.claveMesHoy(), environment.MesInicial, this.mesSeleccionado()])].sort()
  );

  readonly gastosFiltrados = computed(() => {
    const filtro = this.filtro();
    if (filtro === 'pending') return this.gastos().filter(g => !g.paid);
    if (filtro === 'paid') return this.gastos().filter(g => g.paid);
    return this.gastos();
  });
  readonly gastosFijos = computed(() => this.gastosFiltrados().filter(g => g.isFixed));
  readonly gastosVariables = computed(() => this.gastosFiltrados().filter(g => !g.isFixed));

  // Presentación: gastos variables del mes por día (los fijos y el arriendo no tienen un día de compra real)
  readonly gastosVariablesPorDia = computed(() =>
    gastosPorDia(this.gastos().filter(g => !g.isFixed), this.mesSeleccionado(), this._fechaService.fechaHoy()));

  // Los últimos 6 gastos variables registrados en el mes (por cuándo se ingresaron, no por la fecha del gasto)
  readonly ultimosGastos = computed(() =>
    ultimosRegistrados(this.gastos().filter(g => !g.isFixed)));

  /** Parte de cada persona en un gasto (monto y si está saldada), en el mismo orden que personas(). */
  partesPorPersona(gasto: ExpenseResponse): (PersonAmount | null)[] {
    return this.personas().map(p => gasto.split.find(s => s.personId === p.id) ?? null);
  }

  /** Vista previa del reparto de un monto aún no guardado (misma regla que la API). */
  previsualizarReparto(monto: number): RepartoPrevio[] {
    const personas = this.personas();
    const montos = this._repartoService.repartir(monto, personas.map(p => p.contribution));
    return personas.map((p, i) => ({ nombre: p.name, porcentaje: p.percentage, monto: montos[i] }));
  }

  // ---------- Carga ----------

  async inicializar() {
    await Promise.all([
      this.cargarPersonas(),
      this.cargarConfiguracion(),
      this.cargarCategorias(),
      this.cargarMes(),
      this.cargarMesesRegistrados()
    ]);
  }

  async cargarPersonas() {
    const resp = await this.ejecutar(() => this._peopleService.obtenerPersonas());
    if (resp) this.personas.set(resp.valor.items);
  }

  async cargarConfiguracion() {
    const resp = await this.ejecutar(() => this._settingsService.obtenerConfiguracion());
    if (resp) this.configuracion.set(resp.valor);
  }

  async cargarCategorias() {
    const resp = await this.ejecutar(() => this._categoriesService.obtenerCategorias());
    if (resp) this.categorias.set(resp.valor);
  }

  async cargarMesesRegistrados() {
    const resp = await this.ejecutar(() => this._monthsService.obtenerMeses());
    if (resp) this.mesesRegistrados.set(resp.valor);
  }

  async cargarMes() {
    const mes = this.mesSeleccionado();
    this.cargando.set(true);
    const resp = await this.ejecutar(() => Promise.all([
      this._monthsService.obtenerGastos(mes),
      this._monthsService.obtenerResumen(mes),
      this._monthsService.obtenerHistorial(mes)
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

  // ---------- Navegación ----------

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

  abrirModalArriendo() {
    this.modalAbierto.set('arriendo');
  }

  abrirModalNuevoGasto() {
    this.gastoEnEdicion.set(null);
    this.modalAbierto.set('gasto');
  }

  abrirModalEditarGasto(gasto: ExpenseResponse) {
    if (gasto.isRent) {
      this.abrirModalArriendo();
      return;
    }
    this.gastoEnEdicion.set(gasto);
    this.modalAbierto.set('gasto');
  }

  abrirModalConfiguracion() {
    this.modalAbierto.set('configuracion');
  }

  cerrarModal() {
    this.modalAbierto.set(null);
    this.gastoEnEdicion.set(null);
  }

  // ---------- Acciones ----------

  async cambiarEstadoPago(gasto: ExpenseResponse) {
    const pagado = !gasto.paid;
    const resp = await this.ejecutar(() => this._expensesService.cambiarEstadoPago(gasto.id, pagado));
    if (!resp) return;

    await this.cargarMes();
    // Con quien pagó registrado, el botón salda la parte de los demás
    const deudores = gasto.paidBy ? this.nombresDeudores(gasto) : '';
    const mensaje = deudores
      ? (pagado ? `${deudores} saldó su parte con ${gasto.paidByName}` : `Parte de ${deudores} marcada como pendiente`)
      : (pagado ? 'Marcado como pagado' : 'Marcado como pendiente');
    this._toastService.mostrar(mensaje, pagado ? '✓' : 'ℹ');
  }

  /** Personas que le deben su parte a quien pagó el gasto (ej. "Dairyn"). */
  nombresDeudores(gasto: ExpenseResponse): string {
    return gasto.split
      .filter(s => s.personId !== gasto.paidBy)
      .map(s => s.name)
      .join(', ');
  }

  async eliminarGasto(gasto: ExpenseResponse, alcance: DeleteScope) {
    const resp = await this.ejecutar(() => this._expensesService.eliminarGasto(gasto.id, alcance));
    if (!resp) return;

    await Promise.all([this.cargarMes(), this.cargarMesesRegistrados()]);
    this._toastService.mostrar(alcance === 'Plan' ? 'Se eliminaron las cuotas del plan' : 'Gasto eliminado', '🗑️');
  }

  /** Pasa un gasto pendiente al mes siguiente; se queda en el mes que se está viendo (el gasto sale de la lista). */
  async moverAlProximoMes(gasto: ExpenseResponse) {
    const resp = await this.ejecutar(() => this._expensesService.moverAlProximoMes(gasto.id));
    if (!resp) return;

    await this.recargarTrasGuardar();
    this._toastService.mostrar(`"${gasto.description}" se movió a ${this._fechaService.nombreMes(resp.valor.month)}`, '📆');
  }

  async guardarGasto(id: string | null, request: ExpenseRequest): Promise<boolean> {
    if (id) {
      const resp = await this.ejecutar(() => this._expensesService.actualizarGasto(id, request));
      if (!resp) return false;
      await this.recargarTrasGuardar();
      this._toastService.mostrar('Gasto actualizado correctamente', '✓');
      return true;
    }

    const resp = await this.ejecutar(() => this._expensesService.crearGasto(request));
    if (!resp) return false;
    await this.recargarTrasGuardar();

    const { amounts } = resp.valor;
    if (amounts.length > 1) {
      this._toastService.mostrar(`Plan de ${amounts.length} cuotas creado (${this._pesoChileno.transform(amounts[0])}/mes)`, '📅');
    } else {
      this._toastService.mostrar('Gasto guardado con éxito', '✓');
    }
    return true;
  }

  async actualizarArriendo(request: RentRequest) {
    const mes = this.mesSeleccionado();
    const resp = await this.ejecutar(() => this._monthsService.actualizarArriendo(mes, request));
    if (!resp) return;

    this.cerrarModal();
    await this.cargarMes();
    this._toastService.mostrar(`Arriendo de ${this._fechaService.nombreMes(mes)} actualizado`, '🏠');
  }

  /**
   * Aplica en orden: bajas, cambios y altas de personas y de categorías; luego arriendo base/costos
   * fijos y, si cambió, el arriendo del mes activo. Si un paso falla se detiene y recarga el estado real.
   */
  async guardarConfiguracion(cambios: CambiosConfiguracion) {
    const actuales = new Map(this.personas().map(p => [p.id, p]));
    const categoriasActuales = this.categorias();
    const mes = this.mesSeleccionado();

    const resp = await this.ejecutar(async () => {
      for (const id of cambios.personasBorradas) {
        await this._peopleService.eliminarPersona(id);
      }
      for (const persona of cambios.personas) {
        const request = { name: persona.name, contribution: persona.contribution };
        const actual = persona.id ? actuales.get(persona.id) : undefined;
        if (!persona.id) {
          await this._peopleService.crearPersona(request);
        } else if (actual && (actual.name !== request.name || actual.contribution !== request.contribution)) {
          await this._peopleService.actualizarPersona(persona.id, request);
        }
      }

      await aplicarCambiosCategorias(this._categoriesService, categoriasActuales, cambios.categorias);

      await this._settingsService.actualizarConfiguracion(cambios.configuracion);
      if (cambios.arriendoMes) {
        await this._monthsService.actualizarArriendo(mes, cambios.arriendoMes);
      }
    });

    await Promise.all([this.cargarPersonas(), this.cargarCategorias(), this.cargarConfiguracion(), this.cargarMes()]);
    if (!resp) return;

    this.cerrarModal();
    this._toastService.mostrar('Configuración guardada', '⚙️');
  }

  async exportarRespaldo() {
    const resp = await this.ejecutar(() => this._backupService.exportarRespaldo());
    if (!resp) return;

    const blob = new Blob([JSON.stringify(resp.valor, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `gastos_compartidos_backup_${this._fechaService.fechaHoy()}.json`;
    enlace.click();
    URL.revokeObjectURL(url);
    this._toastService.mostrar('Respaldo descargado', '💾');
  }

  async importarRespaldo(archivo: File) {
    let respaldo: unknown;
    try {
      respaldo = JSON.parse(await archivo.text());
    } catch {
      this._toastService.mostrar('Error procesando el archivo JSON', '⚠️');
      return;
    }

    const resp = await this.ejecutar(() => this._backupService.importarRespaldo(respaldo));
    if (!resp) return;

    this.cerrarModal();
    await this.inicializar();
    this._toastService.mostrar('Datos importados con éxito', '🚀');
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
