export interface ColoresPersona {
  punto:  string;
  texto:  string;
  badge:  string;
  barra:  string;
}

// Las clases deben quedar escritas completas para que Tailwind las detecte
const COLORES: ColoresPersona[] = [
  { punto: 'bg-blue-600', texto: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300', barra: 'bg-blue-700/80' },
  { punto: 'bg-violet-500', texto: 'text-violet-600 dark:text-violet-400', badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300', barra: 'bg-blue-800/80' },
  { punto: 'bg-emerald-500', texto: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', barra: 'bg-blue-700/80' },
  { punto: 'bg-amber-500', texto: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300', barra: 'bg-blue-800/80' },
  { punto: 'bg-rose-500', texto: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300', barra: 'bg-blue-700/80' },
  { punto: 'bg-cyan-500', texto: 'text-cyan-600 dark:text-cyan-400', badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300', barra: 'bg-blue-800/80' },
];

/** Color de cada persona según su posición (se repite si hay más de 6). */
export function coloresPersona(indice: number): ColoresPersona {
  return COLORES[indice % COLORES.length];
}
