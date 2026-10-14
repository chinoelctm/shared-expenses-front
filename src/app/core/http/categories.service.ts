import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { apiUrl } from './api';
import { CategoryResponse } from '../interfaces/responses/CategoryResponse';
import { CategoryRequest } from '../interfaces/requests/CategoryRequest';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  protected _http = inject(HttpClient);

  // Solo categorías activas
  async obtenerCategorias(): Promise<CategoryResponse[]> {
    return lastValueFrom(this._http.get<CategoryResponse[]>(`${apiUrl}/categories`));
  }

  async crearCategoria(request: CategoryRequest): Promise<{ id: string }> {
    return lastValueFrom(this._http.post<{ id: string }>(`${apiUrl}/categories`, request));
  }

  async actualizarCategoria(id: string, request: CategoryRequest): Promise<void> {
    await lastValueFrom(this._http.put<void>(`${apiUrl}/categories/${encodeURIComponent(id)}`, request));
  }

  // La API la desactiva: los gastos que ya la usan conservan su nombre y color
  async eliminarCategoria(id: string): Promise<void> {
    await lastValueFrom(this._http.delete<void>(`${apiUrl}/categories/${encodeURIComponent(id)}`));
  }
}
