import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { apiUrl } from './api';
import { PeopleResponse, PersonResponse } from '../interfaces/responses/PersonResponse';
import { PersonRequest } from '../interfaces/requests/PersonRequest';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {

  protected _http = inject(HttpClient);

  async obtenerPersonas(): Promise<PeopleResponse> {
    return lastValueFrom(this._http.get<PeopleResponse>(`${apiUrl}/people`));
  }

  async obtenerPersona(id: string): Promise<PersonResponse> {
    return lastValueFrom(this._http.get<PersonResponse>(`${apiUrl}/people/${id}`));
  }

  async crearPersona(request: PersonRequest): Promise<{ id: string }> {
    return lastValueFrom(this._http.post<{ id: string }>(`${apiUrl}/people`, request));
  }

  async actualizarPersona(id: string, request: PersonRequest): Promise<void> {
    await lastValueFrom(this._http.put<void>(`${apiUrl}/people/${id}`, request));
  }

  async eliminarPersona(id: string): Promise<void> {
    await lastValueFrom(this._http.delete<void>(`${apiUrl}/people/${id}`));
  }
}
