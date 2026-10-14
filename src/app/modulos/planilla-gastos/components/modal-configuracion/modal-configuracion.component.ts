import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanillaStore } from '../../../../core/state/planilla.store';
import { ToastService } from '../../../../core/utils/toast.service';
import { NombreMesPipe } from '../../../../core/pipes/nombre-mes.pipe';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { coloresPersona } from '../../../../core/utils/persona-colores';

interface PersonaEditable {
  id:           string | null;
  name:         string;
  contribution: number | null;
}

interface CostoFijoEditable {
  description: string;
  amount:      number | null;
  category:    string;
}

interface CategoriaEditable {
  id:     string | null;
  name:   string;
  color:  string;
  locked: boolean;
}

const COLOR_NUEVA_CATEGORIA = '#64748b';
const COLOR_HEX = /^#[0-9a-fA-F]{6}$/;

@Component({
  selector: 'app-modal-configuracion',
  standalone: true,
  imports: [FormsModule, NombreMesPipe, PesoChilenoPipe],
  templateUrl: './modal-configuracion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalConfiguracionComponent implements OnInit {

  protected readonly store = inject(PlanillaStore);
  private readonly _toastService = inject(ToastService);
  protected readonly colores = coloresPersona;

  protected personas: PersonaEditable[] = [];
  protected personasBorradas: string[] = [];
  protected categorias: CategoriaEditable[] = [];
  protected categoriasBorradas: string[] = [];
  protected arriendoMesActivo: number | null = null;
  protected arriendoBase: number | null = null;
  protected costosFijos: CostoFijoEditable[] = [];
  protected guardando = false;

  private arriendoMesOriginal = 0;

  ngOnInit(): void {
    const config = this.store.configuracion();
    this.personas = this.store.personas().map(p => ({ id: p.id, name: p.name, contribution: p.contribution }));
    this.categorias = this.store.categorias().map(c => ({ id: c.id, name: c.name, color: c.color, locked: c.locked }));
    this.arriendoMesOriginal = this.store.arriendo()?.amount ?? config?.defaultRent ?? 0;
    this.arriendoMesActivo = this.arriendoMesOriginal;
    this.arriendoBase = config?.defaultRent ?? 0;
    this.costosFijos = (config?.fixedCosts ?? []).map(cf => ({ description: cf.description, amount: cf.amount, category: cf.category }));
  }

  // Vista previa: misma fórmula que la API (aporte / suma de aportes)
  protected get totalAportes(): number {
    return this.personas.reduce((suma, p) => suma + (Number(p.contribution) || 0), 0);
  }

  protected porcentaje(persona: PersonaEditable): number {
    const total = this.totalAportes;
    return total > 0 ? ((Number(persona.contribution) || 0) / total) * 100 : 0;
  }

  protected agregarPersona() {
    this.personas = [...this.personas, { id: null, name: '', contribution: null }];
  }

  protected quitarPersona(indice: number) {
    const persona = this.personas[indice];
    if (persona.id) this.personasBorradas = [...this.personasBorradas, persona.id];
    this.personas = this.personas.filter((_, i) => i !== indice);
  }

  protected agregarCategoria() {
    this.categorias = [...this.categorias, { id: null, name: '', color: COLOR_NUEVA_CATEGORIA, locked: false }];
  }

  protected quitarCategoria(indice: number) {
    const categoria = this.categorias[indice];
    if (categoria.locked) return;
    if (categoria.id) this.categoriasBorradas = [...this.categoriasBorradas, categoria.id];
    this.categorias = this.categorias.filter((_, i) => i !== indice);
  }

  /**
   * Opciones de categoría para un costo fijo: las activas y, si el costo usa una categoría eliminada,
   * esa también (para no perderla al guardar).
   */
  protected opcionesCategoria(costo: CostoFijoEditable): { id: string; nombre: string }[] {
    const activas = this.store.categorias().map(c => ({ id: c.id, nombre: c.name }));
    if (activas.some(c => c.id === costo.category)) return activas;

    const original = this.store.configuracion()?.fixedCosts.find(cf => cf.category === costo.category);
    return [...activas, { id: costo.category, nombre: `${original?.categoryName ?? costo.category} (eliminada)` }];
  }

  protected agregarCosto() {
    this.costosFijos = [...this.costosFijos, { description: '', amount: null, category: 'Housing' }];
  }

  protected eliminarCosto(indice: number) {
    this.costosFijos = this.costosFijos.filter((_, i) => i !== indice);
  }

  protected async guardar() {
    const personas = this.personas.map(p => ({
      id: p.id,
      name: p.name.trim(),
      contribution: Math.round(Number(p.contribution)) || 0
    }));

    if (personas.some(p => !p.name || p.contribution <= 0)) {
      this._toastService.mostrar('Cada persona necesita nombre y un aporte mayor a 0.', '⚠️');
      return;
    }
    const nombres = personas.map(p => p.name.toLowerCase());
    if (new Set(nombres).size !== nombres.length) {
      this._toastService.mostrar('Hay dos personas con el mismo nombre.', '⚠️');
      return;
    }

    const categorias = this.categorias.map(c => ({ id: c.id, name: c.name.trim(), color: c.color }));
    if (categorias.some(c => !c.name || !COLOR_HEX.test(c.color))) {
      this._toastService.mostrar('Cada categoría necesita nombre y un color válido.', '⚠️');
      return;
    }
    const nombresCategoria = categorias.map(c => c.name.toLowerCase());
    if (new Set(nombresCategoria).size !== nombresCategoria.length) {
      this._toastService.mostrar('Hay dos categorías con el mismo nombre.', '⚠️');
      return;
    }

    const arriendoMes = Math.round(Number(this.arriendoMesActivo)) || 0;

    this.guardando = true;
    await this.store.guardarConfiguracion({
      personas,
      personasBorradas: this.personasBorradas,
      categorias,
      categoriasBorradas: this.categoriasBorradas,
      configuracion: {
        defaultRent: Math.round(Number(this.arriendoBase)) || 0,
        fixedCosts: this.costosFijos
          .map(cf => ({ description: cf.description.trim(), amount: Math.round(Number(cf.amount)) || 0, category: cf.category }))
          .filter(cf => cf.description && cf.amount > 0)
      },
      arriendoMes: arriendoMes !== this.arriendoMesOriginal
        ? { amount: arriendoMes, paid: this.store.arriendo()?.paid ?? false }
        : null
    });
    this.guardando = false;
  }

  protected importar(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (archivo) this.store.importarRespaldo(archivo);
    input.value = '';
  }
}
