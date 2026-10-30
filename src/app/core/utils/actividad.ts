export interface GastoDelDia {
  dia:    number;
  fecha:  string;
  monto:  number;
  esHoy:  boolean;
}

/**
 * Suma de los gastos de cada día del mes (YYYY-MM), según su fecha. Incluye los días sin gastos para que el gráfico
 * muestre el mes completo.
 */
export function gastosPorDia(gastos: { date: string; amount: number }[], mes: string, hoy: string): GastoDelDia[] {
  const [anio, numeroMes] = mes.split('-').map(Number);
  const diasDelMes = new Date(anio, numeroMes, 0).getDate();

  const montos = new Array<number>(diasDelMes).fill(0);
  for (const gasto of gastos) {
    if (!gasto.date.startsWith(mes)) continue;
    const dia = Number(gasto.date.slice(8, 10));
    if (dia >= 1 && dia <= diasDelMes) montos[dia - 1] += gasto.amount;
  }

  return montos.map((monto, i) => {
    const fecha = `${mes}-${String(i + 1).padStart(2, '0')}`;
    return { dia: i + 1, fecha, monto, esHoy: fecha === hoy };
  });
}

/** Total acumulado al cierre de cada día: la curva del minigráfico. */
export function acumulado(dias: GastoDelDia[]): number[] {
  let total = 0;
  return dias.map(d => total += d.monto);
}

/** Los `cantidad` gastos registrados más recientemente (por cuándo se ingresaron, no por la fecha del gasto). */
export function ultimosRegistrados<T extends { createdOn: string }>(gastos: T[], cantidad = 6): T[] {
  return [...gastos].sort((a, b) => Date.parse(b.createdOn) - Date.parse(a.createdOn)).slice(0, cantidad);
}
