import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmService } from '../../core/utils/confirm.service';
import { EstiloOpcion } from '../../core/interfaces/Confirmacion';

const ESTILOS: Record<EstiloOpcion, string> = {
  primario: 'boton-principal',
  peligro: 'bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20',
  secundario: 'boton-vidrio',
};

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {

  protected readonly confirmService = inject(ConfirmService);

  protected estilo(estilo: EstiloOpcion): string {
    return ESTILOS[estilo];
  }
}
