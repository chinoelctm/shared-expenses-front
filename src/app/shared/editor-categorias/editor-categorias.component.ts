import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryResponse } from '../../core/interfaces/responses/CategoryResponse';
import { CambiosCategorias, validarCategorias } from '../../core/utils/categorias';

interface CategoriaEditable {
  id:     string | null;
  name:   string;
  color:  string;
  locked: boolean;
}

const COLOR_NUEVA_CATEGORIA = '#64748b';

/**
 * Edición de las categorías (nombre, color, agregar y eliminar) dentro de un modal de configuración. Las categorías
 * son las mismas para la planilla compartida y los gastos personales. No guarda: el modal pide `cambios()` al guardar.
 */
@Component({
  selector: 'app-editor-categorias',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './editor-categorias.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class EditorCategoriasComponent implements OnInit {

  // Categorías activas al abrir el modal
  readonly categorias = input.required<CategoryResponse[]>();
  // Título de la sección (con su número dentro del modal)
  readonly titulo = input('Categorías');

  protected lista: CategoriaEditable[] = [];
  private borradas: string[] = [];

  ngOnInit(): void {
    this.lista = this.categorias().map(c => ({ id: c.id, name: c.name, color: c.color, locked: c.locked }));
  }

  protected agregar() {
    this.lista = [...this.lista, { id: null, name: '', color: COLOR_NUEVA_CATEGORIA, locked: false }];
  }

  protected quitar(indice: number) {
    const categoria = this.lista[indice];
    if (categoria.locked) return;
    if (categoria.id) this.borradas = [...this.borradas, categoria.id];
    this.lista = this.lista.filter((_, i) => i !== indice);
  }

  /** null si se puede guardar; si no, el mensaje para mostrar. */
  error(): string | null {
    return validarCategorias(this.lista);
  }

  cambios(): CambiosCategorias {
    return {
      categorias: this.lista.map(c => ({ id: c.id, name: c.name.trim(), color: c.color })),
      borradas: this.borradas
    };
  }
}
