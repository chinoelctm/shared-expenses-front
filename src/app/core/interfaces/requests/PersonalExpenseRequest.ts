export interface PersonalExpenseRequest {
    description:   string;
    amount:        number;
    date:          string;
    category:      string;
    // Solo al crear: 1 = gasto normal; 2..48 = plan de cuotas
    installments?: number;
}
