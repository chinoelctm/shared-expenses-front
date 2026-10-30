import { colorPresupuesto, nivelPresupuesto } from './presupuesto';

describe('presupuesto', () => {
  it('pasa de bien a atención en el umbral y a excedido sobre el 100 %', () => {
    expect(nivelPresupuesto(0, 75)).toBe('bien');
    expect(nivelPresupuesto(74, 75)).toBe('bien');
    expect(nivelPresupuesto(75, 75)).toBe('atencion');
    expect(nivelPresupuesto(100, 75)).toBe('atencion');
    expect(nivelPresupuesto(101, 75)).toBe('excedido');
  });

  it('el color va de verde a amarillo, naranjo y rojo', () => {
    expect(colorPresupuesto(0, 75)).toBe('hsl(145 80% 45%)');
    expect(colorPresupuesto(75, 75)).toBe('hsl(45 80% 45%)');
    expect(colorPresupuesto(100, 75)).toBe('hsl(28 80% 45%)');
    expect(colorPresupuesto(130, 75)).toBe('hsl(0 80% 45%)');
  });
});
