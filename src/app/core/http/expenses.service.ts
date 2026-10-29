import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { apiUrl } from './api';
import { AddExpenseResponse, ExpenseResponse, MoveExpenseResponse } from '../interfaces/responses/ExpenseResponse';
import { DeleteScope, ExpenseRequest } from '../interfaces/requests/ExpenseRequest';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  protected _http = inject(HttpClient);

  async obtenerGasto(id: string): Promise<ExpenseResponse> {
    return lastValueFrom(this._http.get<ExpenseResponse>(`${apiUrl}/expenses/${id}`));
  }

  // Con installments > 1 la API crea una cuota por mes desde la fecha indicada
  async crearGasto(request: ExpenseRequest): Promise<AddExpenseResponse> {
    return lastValueFrom(this._http.post<AddExpenseResponse>(`${apiUrl}/expenses`, request));
  }

  async actualizarGasto(id: string, request: ExpenseRequest): Promise<void> {
    await lastValueFrom(this._http.put<void>(`${apiUrl}/expenses/${id}`, request));
  }

  async cambiarEstadoPago(id: string, paid: boolean): Promise<void> {
    await lastValueFrom(this._http.patch<void>(`${apiUrl}/expenses/${id}/payment`, { paid }));
  }

  // Solo gastos pendientes: la API corre la fecha un mes y agrega "(Gasto mes anterior pendiente)" a la descripción
  async moverAlProximoMes(id: string): Promise<MoveExpenseResponse> {
    return lastValueFrom(this._http.post<MoveExpenseResponse>(`${apiUrl}/expenses/${id}/move-to-next-month`, null));
  }

  async eliminarGasto(id: string, scope: DeleteScope = 'Single'): Promise<void> {
    await lastValueFrom(this._http.delete<void>(`${apiUrl}/expenses/${id}`, { params: { scope } }));
  }
}
