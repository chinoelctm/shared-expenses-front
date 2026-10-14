export interface ExpenseRequest {
    description:   string;
    amount:        number;
    date:          string;
    category:      string;
    isFixed:       boolean;
    paid:          boolean;
    installments?: number;
    paidBy?:       string | null;
}

export type DeleteScope = 'Single' | 'Plan';
