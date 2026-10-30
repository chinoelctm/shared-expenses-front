import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FechaService {

  claveMesHoy(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  }

  fechaHoy(): string {
    const hoy = new Date();
    return `${this.claveMesHoy()}-${String(hoy.getDate()).padStart(2, '0')}`;
  }

  desplazarMes(mes: string, delta: number): string {
    const [y, m] = mes.split('-').map(Number);
    const fecha = new Date(y, m - 1 + delta, 1);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  }

  // "2026-10" => "Oct"
  nombreMesCorto(mes: string): string {
    const [y, m] = mes.split('-').map(Number);
    const nombre = new Date(y, m - 1, 1).toLocaleDateString('es-CL', { month: 'short' }).replace('.', '');
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }

  nombreMes(mes: string): string {
    const [y, m] = mes.split('-').map(Number);
    const nombre = new Date(y, m - 1, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }
}
