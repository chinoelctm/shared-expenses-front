import { Pipe, PipeTransform } from '@angular/core';

// Clave = código de categoría de la API. Las clases deben quedar escritas completas para Tailwind.
const COLORES: Record<string, string> = {
  Supermarket: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
  BasicServices: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
  Housing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
  Home: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300',
  Leisure: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
  Celebrations: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
  Food: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
  Technology: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
  Health: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
};

const COLOR_POR_DEFECTO = 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';

@Pipe({
  standalone: true,
  name: 'categoriaColor',
})
export class CategoriaColorPipe implements PipeTransform {
  transform(categoria: string | null | undefined): string {
    return COLORES[categoria ?? ''] ?? COLOR_POR_DEFECTO;
  }
}
