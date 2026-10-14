import { PersonAmount } from './PersonResponse';

export interface ExpenseResponse {
    id:           string;
    month:        string;
    description:  string;
    amount:       number;
    date:         string;
    category:     string;
    categoryName: string;
    isFixed:      boolean;
    isRent:       boolean;
    // Sin paidBy: gasto pagado. Con paidBy: los demás ya le devolvieron su parte a quien pagó
    paid:         boolean;
    // Persona que pagó el total al momento de la compra
    paidBy:       string | null;
    paidByName:   string | null;
    installment:  Installment | null;
    split:        PersonAmount[];
}

export interface Installment {
    planId: string;
    number: number;
    total:  number;
}

export interface MonthExpensesResponse {
    month: string;
    items: ExpenseResponse[];
}

export interface AddExpenseResponse {
    ids:     string[];
    planId:  string | null;
    amounts: number[];
}
