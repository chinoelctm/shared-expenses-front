import { ordenarCategorias, validarCategorias } from './categorias';

describe('categorias', () => {
  it('ordena de la A a la Z sin distinguir mayúsculas ni tildes', () => {
    const ordenadas = ordenarCategorias([
      { name: 'Supermercado' }, { name: 'auto' }, { name: 'Ócio' }, { name: 'Almuerzo' }, { name: 'Bencina' }
    ]);
    expect(ordenadas.map(c => c.name)).toEqual(['Almuerzo', 'auto', 'Bencina', 'Ócio', 'Supermercado']);
  });

  it('valida nombre, color y nombres repetidos', () => {
    expect(validarCategorias([{ id: null, name: 'Feria', color: '#10b981' }])).toBeNull();
    expect(validarCategorias([{ id: null, name: ' ', color: '#10b981' }])).toContain('nombre');
    expect(validarCategorias([{ id: null, name: 'Feria', color: 'verde' }])).toContain('color');
    expect(validarCategorias([
      { id: '1', name: 'Feria', color: '#10b981' }, { id: null, name: 'feria ', color: '#f59e0b' }
    ])).toContain('mismo nombre');
  });
});
