import { acumulado, gastosPorDia } from './actividad';

describe('gastosPorDia', () => {
  it('suma los gastos de cada día e incluye los días sin gastos', () => {
    const dias = gastosPorDia([
      { date: '2026-02-03', amount: 1000 },
      { date: '2026-02-03', amount: 500 },
      { date: '2026-02-28', amount: 200 },
      { date: '2026-03-01', amount: 999 }
    ], '2026-02', '2026-02-28');

    expect(dias.length).toBe(28);
    expect(dias[2].monto).toBe(1500);
    expect(dias[27]).toEqual({ dia: 28, fecha: '2026-02-28', monto: 200, esHoy: true });
    expect(dias.filter(d => d.esHoy).length).toBe(1);
  });

  it('acumula el total al cierre de cada día', () => {
    const dias = gastosPorDia([
      { date: '2026-04-01', amount: 100 },
      { date: '2026-04-03', amount: 50 }
    ], '2026-04', '2026-05-01');

    expect(acumulado(dias).slice(0, 4)).toEqual([100, 100, 150, 150]);
  });
});
