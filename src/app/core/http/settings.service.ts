import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { apiUrl } from './api';
import { SettingsResponse } from '../interfaces/responses/SettingsResponse';
import { SettingsRequest } from '../interfaces/requests/SettingsRequest';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  protected _http = inject(HttpClient);

  async obtenerConfiguracion(): Promise<SettingsResponse> {
    return lastValueFrom(this._http.get<SettingsResponse>(`${apiUrl}/settings`));
  }

  async actualizarConfiguracion(request: SettingsRequest): Promise<void> {
    await lastValueFrom(this._http.put<void>(`${apiUrl}/settings`, request));
  }
}
