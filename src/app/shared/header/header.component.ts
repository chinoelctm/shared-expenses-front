import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PlanillaStore } from '../../core/state/planilla.store';
import { SesionStore } from '../../core/state/sesion.store';
import { ConfirmService } from '../../core/utils/confirm.service';
import { PesoChilenoPipe } from '../../core/pipes/peso-chileno.pipe';
import { NombreMesPipe } from '../../core/pipes/nombre-mes.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [PesoChilenoPipe, NombreMesPipe],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  protected readonly store = inject(PlanillaStore);
  protected readonly sesion = inject(SesionStore);
  private readonly _confirmService = inject(ConfirmService);

  protected readonly iniciales = computed(() =>
    this.store.personas().slice(0, 3).map(p => p.name.charAt(0)).join('').toUpperCase() || 'GC'
  );

  protected async cerrarSesion() {
    const respuesta = await this._confirmService.preguntar({
      titulo: '¿Cerrar sesión?',
      mensaje: 'Tendrás que volver a ingresar tu usuario y contraseña para ver la planilla.',
      opciones: [
        { etiqueta: 'Cancelar', valor: 'no', estilo: 'secundario' },
        { etiqueta: 'Cerrar sesión', valor: 'si', estilo: 'primario' }
      ]
    });
    if (respuesta === 'si') await this.sesion.cerrarSesion();
  }

  protected cambiarMes(event: Event) {
    this.store.cambiarMes((event.target as HTMLSelectElement).value);
  }
}
