import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { apiUrl } from './api';
import { MonthExpensesResponse } from '../interfaces/responses/ExpenseResponse';
import { MonthSummaryResponse, MonthTotal } from '../interfaces/responses/MonthSummaryResponse';
import { RentRequest } from '../interfaces/requests/RentRequest';

@Injectable({
  providedIn: 'root'
})
export class MonthsService {

  protected _http = inject(HttpClient);

  async obtenerMeses(): Promise<string[]> {
    return lastValueFrom(this._http.get<string[]>(`${apiUrl}/months`));
  }

  // Si el mes no existe, la API lo abre con el arriendo base y los costos fijos
  async obtenerGastos(mes: string): Promise<MonthExpensesResponse> {
    return lastValueFrom(this._http.get<MonthExpensesResponse>(`${apiUrl}/months/${mes}/expenses`));
  }

  async obtenerResumen(mes: string): Promise<MonthSummaryResponse> {
    return lastValueFrom(this._http.get<MonthSummaryResponse>(`${apiUrl}/months/${mes}/summary`));
  }

  // Total de los últimos meses hasta `mes`, del más antiguo al más reciente (no abre meses nuevos)
  async obtenerHistorial(mes: string): Promise<MonthTotal[]> {
    return lastValueFrom(this._http.get<MonthTotal[]>(`${apiUrl}/months/${mes}/history`));
  }

  async actualizarArriendo(mes: string, request: RentRequest): Promise<void> {
    await lastValueFrom(this._http.put<void>(`${apiUrl}/months/${mes}/rent`, request));
  }
}
