import { CategoriesService } from '../http/categories.service';
import { CategoryResponse } from '../interfaces/responses/CategoryResponse';

export interface CategoriaEditada {
  id:    string | null;
  name:  string;
  color: string;
}

export interface CambiosCategorias {
  categorias: CategoriaEditada[];
  borradas:   string[];
}

const COLOR_HEX = /^#[0-9a-fA-F]{6}$/;

/** Categorías de la A a la Z por nombre (sin distinguir mayúsculas ni tildes), como se muestran en los selectores. */
export function ordenarCategorias<T extends { name: string }>(categorias: T[]): T[] {
  return [...categorias].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

/** null si los cambios son válidos; si no, el mensaje para mostrar. */
export function validarCategorias(categorias: CategoriaEditada[]): string | null {
  if (categorias.some(c => !c.name.trim() || !COLOR_HEX.test(c.color))) {
    return 'Cada categoría necesita nombre y un color válido.';
  }
  const nombres = categorias.map(c => c.name.trim().toLowerCase());
  return new Set(nombres).size !== nombres.length ? 'Hay dos categorías con el mismo nombre.' : null;
}

/**
 * Aplica en la API las bajas, cambios y altas de categorías. Primero las bajas: así se puede crear una categoría
 * nueva con el nombre de una eliminada. Solo se actualizan las que cambiaron respecto de `actuales`.
 */
export async function aplicarCambiosCategorias(service: CategoriesService, actuales: CategoryResponse[],
                                               cambios: CambiosCategorias): Promise<void> {
  const porId = new Map(actuales.map(c => [c.id, c]));

  for (const id of cambios.borradas) {
    await service.eliminarCategoria(id);
  }
  for (const categoria of cambios.categorias) {
    const request = { name: categoria.name.trim(), color: categoria.color };
    const actual = categoria.id ? porId.get(categoria.id) : undefined;
    if (!categoria.id) {
      await service.crearCategoria(request);
    } else if (actual && (actual.name !== request.name || actual.color.toLowerCase() !== request.color.toLowerCase())) {
      await service.actualizarCategoria(categoria.id, request);
    }
  }
}
