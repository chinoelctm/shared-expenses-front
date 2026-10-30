import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { PlanillaStore } from '../../core/state/planilla.store';
import { PersonalStore } from '../../core/state/personal.store';
import { SesionStore } from '../../core/state/sesion.store';
import { ConfirmService } from '../../core/utils/confirm.service';
import { PesoChilenoPipe } from '../../core/pipes/peso-chileno.pipe';
import { NombreMesPipe } from '../../core/pipes/nombre-mes.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [PesoChilenoPipe, NombreMesPipe, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  protected readonly store = inject(PlanillaStore);
  protected readonly personal = inject(PersonalStore);
  protected readonly sesion = inject(SesionStore);
  private readonly _confirmService = inject(ConfirmService);
  private readonly _router = inject(Router);

  private readonly url = toSignal(
    this._router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this._router.url)),
    { initialValue: this._router.url });

  // La barra maneja el mes de la vista activa: planilla compartida o gastos personales
  protected readonly esPersonal = computed(() => this.url().startsWith('/personales'));
  protected readonly navegacion = computed(() => this.esPersonal() ? this.personal : this.store);

  // Iniciales del usuario de la sesión para el avatar ("Joaquín Márquez" → "JM")
  protected readonly iniciales = computed(() =>
    (this.sesion.usuario()?.name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase() || 'GC'
  );

  protected abrirConfiguracion() {
    if (this.esPersonal()) this.personal.abrirModalPresupuesto();
    else this.store.abrirModalConfiguracion();
  }

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
    this.navegacion().cambiarMes((event.target as HTMLSelectElement).value);
  }
}
