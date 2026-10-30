import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { apiUrl } from './api';
import { AddExpenseResponse } from '../interfaces/responses/ExpenseResponse';
import { PersonalMonthExpensesResponse, PersonalMonthTotal, PersonalSummaryResponse } from '../interfaces/responses/PersonalResponse';
import { PersonalExpenseRequest } from '../interfaces/requests/PersonalExpenseRequest';
import { DeleteScope } from '../interfaces/requests/ExpenseRequest';

/** Gastos personales del usuario de la sesión (la API los filtra por el usuario del token). */
@Injectable({
  providedIn: 'root'
})
export class PersonalService {

  protected _http = inject(HttpClient);

  async obtenerMeses(): Promise<string[]> {
    return lastValueFrom(this._http.get<string[]>(`${apiUrl}/personal/months`));
  }

  async obtenerGastos(mes: string): Promise<PersonalMonthExpensesResponse> {
    return lastValueFrom(this._http.get<PersonalMonthExpensesResponse>(`${apiUrl}/personal/months/${mes}/expenses`));
  }

  async obtenerResumen(mes: string): Promise<PersonalSummaryResponse> {
    return lastValueFrom(this._http.get<PersonalSummaryResponse>(`${apiUrl}/personal/months/${mes}/summary`));
  }

  // Total y presupuesto de los últimos meses hasta `mes`, del más antiguo al más reciente
  async obtenerHistorial(mes: string): Promise<PersonalMonthTotal[]> {
    return lastValueFrom(this._http.get<PersonalMonthTotal[]>(`${apiUrl}/personal/months/${mes}/history`));
  }

  // Rige desde ese mes y en los siguientes hasta que se cambie
  async actualizarPresupuesto(mes: string, monto: number): Promise<void> {
    await lastValueFrom(this._http.put<void>(`${apiUrl}/personal/months/${mes}/budget`, { amount: monto }));
  }

  async crearGasto(request: PersonalExpenseRequest): Promise<AddExpenseResponse> {
    return lastValueFrom(this._http.post<AddExpenseResponse>(`${apiUrl}/personal/expenses`, request));
  }

  async actualizarGasto(id: string, request: PersonalExpenseRequest): Promise<void> {
    await lastValueFrom(this._http.put<void>(`${apiUrl}/personal/expenses/${id}`, request));
  }

  async eliminarGasto(id: string, scope: DeleteScope = 'Single'): Promise<void> {
    await lastValueFrom(this._http.delete<void>(`${apiUrl}/personal/expenses/${id}`, { params: { scope } }));
  }
}
