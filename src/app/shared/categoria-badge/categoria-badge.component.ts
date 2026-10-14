import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Etiqueta de categoría con el color configurado (fondo y borde translúcidos, texto del mismo color). */
@Component({
  selector: 'app-categoria-badge',
  standalone: true,
  imports: [],
  template: `
    <span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap"
          [style.color]="color"
          [style.background-color]="color + '1f'"
          [style.border-color]="color + '59'">{{ nombre }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriaBadgeComponent {
  @Input({ required: true }) nombre!: string;
  // Color #rrggbb; el sufijo de 2 dígitos agrega transparencia
  @Input({ required: true }) color!: string;
}
