export type FiltroGasto = 'all' | 'pending' | 'paid';

export type ModalPlanilla = 'arriendo' | 'gasto' | 'configuracion' | null;

// Categoría del resumen con el color asignado para el gráfico
export interface CategoriaResumen {
    nombre:     string;
    monto:      number;
    porcentaje: number;
    color:      string;
}
