import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import environment from '../../../../../assets/config/config.json';
import { PersonalStore } from '../../../../core/state/personal.store';
import { PesoChilenoPipe } from '../../../../core/pipes/peso-chileno.pipe';
import { NombreMesPipe } from '../../../../core/pipes/nombre-mes.pipe';
import { colorPresupuesto, nivelPresupuesto } from '../../../../core/utils/presupuesto';

/**
 * Cuánto se lleva gastado en el mes contra el presupuesto configurado. El color pasa de verde a amarillo (desde el
 * umbral de aviso) y a rojo al pasarse.
 */
@Component({
  selector: 'app-aviso-presupuesto',
  standalone: true,
  imports: [PesoChilenoPipe, NombreMesPipe],
  templateUrl: './aviso-presupuesto.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // El texto usa el color del aviso oscurecido (tema claro) o aclarado (tema oscuro) para que se lea bien
  styles: `
    .texto-aviso { color: color-mix(in srgb, var(--aviso) 72%, #0f172a); }
    @media (prefers-color-scheme: dark) {
      .texto-aviso { color: color-mix(in srgb, var(--aviso) 70%, #ffffff); }
    }
  `
})
export class AvisoPresupuestoComponent {

  protected readonly store = inject(PersonalStore);
  protected readonly umbral: number = environment.UmbralAvisoPresupuesto;

  protected readonly total = computed(() => this.store.resumen()?.total ?? 0);
  protected readonly presupuesto = computed(() => this.store.resumen()?.budget ?? null);
  protected readonly porcentaje = computed(() => this.presupuesto()?.percentage ?? 0);
  protected readonly nivel = computed(() => nivelPresupuesto(this.porcentaje(), this.umbral));
  protected readonly color = computed(() => colorPresupuesto(this.porcentaje(), this.umbral));

  // Se configuró en un mes anterior y rige también en este
  protected readonly heredado = computed(() => {
    const presupuesto = this.presupuesto();
    return !!presupuesto && presupuesto.from !== this.store.mesSeleccionado();
  });

  protected readonly mensaje = computed(() => {
    const presupuesto = this.presupuesto();
    if (!presupuesto) return '';
    const resta = Math.abs(presupuesto.remaining);
    switch (this.nivel()) {
      case 'excedido': return `¡Te pasaste del presupuesto por ${this._peso.transform(resta)}!`;
      case 'atencion': return `Cuidado: llevas el ${presupuesto.percentage} %. Te quedan ${this._peso.transform(resta)}.`;
      default: return `Vas bien: te quedan ${this._peso.transform(resta)} por gastar.`;
    }
  });

  private readonly _peso = new PesoChilenoPipe();
}
