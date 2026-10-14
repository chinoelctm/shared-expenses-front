import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { apiUrl } from './api';
import { AddExpenseResponse, ExpenseResponse } from '../interfaces/responses/ExpenseResponse';
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

  async eliminarGasto(id: string, scope: DeleteScope = 'Single'): Promise<void> {
    await lastValueFrom(this._http.delete<void>(`${apiUrl}/expenses/${id}`, { params: { scope } }));
  }
}
