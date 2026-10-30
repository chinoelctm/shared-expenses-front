export type NivelPresupuesto = 'bien' | 'atencion' | 'excedido';

/**
 * Estado del presupuesto según cuánto se gastó: bien hasta el umbral de aviso, atención entre el umbral y el 100 %,
 * y excedido cuando se pasa del monto configurado.
 */
export function nivelPresupuesto(porcentaje: number, umbralAviso: number): NivelPresupuesto {
  if (porcentaje > 100) return 'excedido';
  return porcentaje >= umbralAviso ? 'atencion' : 'bien';
}

/**
 * Color que cambia de forma continua con lo gastado: verde al empezar, amarillo en el umbral de aviso, naranjo al
 * llegar al 100 % y rojo al pasarse. Devuelve un tono HSL listo para usar en un estilo.
 */
export function colorPresupuesto(porcentaje: number, umbralAviso: number): string {
  const VERDE = 145, AMARILLO = 45, NARANJO = 28, ROJO = 0;
  let tono: number;
  if (porcentaje > 100) {
    tono = ROJO;
  } else if (porcentaje >= umbralAviso) {
    tono = AMARILLO + (NARANJO - AMARILLO) * ((porcentaje - umbralAviso) / Math.max(1, 100 - umbralAviso));
  } else {
    tono = VERDE + (AMARILLO - VERDE) * (Math.max(0, porcentaje) / umbralAviso);
  }
  return `hsl(${Math.round(tono)} 80% 45%)`;
}
