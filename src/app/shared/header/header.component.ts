import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PlanillaStore } from '../../core/state/planilla.store';
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

  protected readonly iniciales = computed(() =>
    this.store.personas().slice(0, 3).map(p => p.name.charAt(0)).join('').toUpperCase() || 'GC'
  );

  protected cambiarMes(event: Event) {
    this.store.cambiarMes((event.target as HTMLSelectElement).value);
  }
}
