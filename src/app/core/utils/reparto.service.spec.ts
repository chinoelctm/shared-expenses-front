import { RepartoService } from './reparto.service';

describe('RepartoService', () => {
  const service = new RepartoService();

  it('reparte igual que la API con 2 personas', () => {
    expect(service.repartir(465710, [1000000, 400000])).toEqual([332650, 133060]);
    expect(service.repartir(15000, [1000000, 400000])).toEqual([10714, 4286]);
    expect(service.repartir(131770, [1000000, 400000])).toEqual([94121, 37649]);
  });

  it('entrega el sobrante a la mayor fracción y calza exacto', () => {
    expect(service.repartir(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(service.repartir(999999, [5, 3, 2]).reduce((a, b) => a + b, 0)).toBe(999999);
  });

  it('sin personas no reparte', () => {
    expect(service.repartir(1000, [])).toEqual([]);
  });

  it('carga el remanente en la última cuota', () => {
    expect(service.calcularCuotas(100, 3)).toEqual([33, 33, 34]);
  });
});
