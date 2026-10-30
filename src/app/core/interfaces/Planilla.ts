export type FiltroGasto = 'all' | 'pending' | 'paid';

export type ModalPlanilla = 'arriendo' | 'gasto' | 'configuracion' | null;

// Categoría del resumen con el color asignado para el gráfico
export interface CategoriaResumen {
    nombre:     string;
    monto:      number;
    porcentaje: number;
    color:      string;
}

// Gasto en la línea de tiempo de "Últimos gastos" (compartido o personal)
export interface GastoReciente {
    id:            string;
    description:   string;
    amount:        number;
    date:          string;
    categoryName:  string;
    categoryColor: string;
    installment:   { number: number; total: number } | null;
    paidByName?:   string | null;
}
