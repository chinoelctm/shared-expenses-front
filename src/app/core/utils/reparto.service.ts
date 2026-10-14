import { Injectable } from '@angular/core';

/**
 * Cálculos solo para la vista previa del modal de gastos (antes de guardar).
 * Replica las reglas de la API; los montos definitivos siempre vienen del backend.
 */
@Injectable({
  providedIn: 'root'
})
export class RepartoService {

  // Método del resto mayor, igual que ContributionShares.Split en la API
  repartir(monto: number, aportes: number[]): number[] {
    const total = aportes.reduce((suma, aporte) => suma + aporte, 0);
    if (aportes.length === 0 || total === 0) return aportes.map(() => 0);

    const exactos = aportes.map(aporte => (monto * aporte) / total);
    const resultado = exactos.map(Math.floor);
    let sobrante = monto - resultado.reduce((suma, valor) => suma + valor, 0);

    const porMayorFraccion = exactos
      .map((exacto, i) => ({ i, fraccion: exacto - resultado[i] }))
      .sort((a, b) => b.fraccion - a.fraccion || a.i - b.i);

    for (const { i } of porMayorFraccion) {
      if (sobrante <= 0) break;
      resultado[i]++;
      sobrante--;
    }
    return resultado;
  }

  // El remanente de la división se carga en la última cuota
  calcularCuotas(total: number, numCuotas: number): number[] {
    const n = Math.max(1, Math.floor(numCuotas) || 1);
    const base = Math.floor(total / n);
    const remanente = total - base * n;
    return Array.from({ length: n }, (_, i) => (i === n - 1 ? base + remanente : base));
  }
}
