import { Installment } from './ExpenseResponse';
import { CategorySummary } from './MonthSummaryResponse';

// Gasto personal: siempre variable, sin reparto entre personas
export interface PersonalExpenseResponse {
    id:            string;
    month:         string;
    description:   string;
    amount:        number;
    date:          string;
    category:      string;
    categoryName:  string;
    categoryColor: string;
    installment:   Installment | null;
}

export interface PersonalMonthExpensesResponse {
    month: string;
    items: PersonalExpenseResponse[];
}

export interface PersonalSummaryResponse {
    month:      string;
    total:      number;
    count:      number;
    // null si todavía no se configuró un presupuesto para este mes ni para uno anterior
    budget:     PersonalBudget | null;
    categories: CategorySummary[];
}

export interface PersonalBudget {
    amount:     number;
    // Mes desde el que rige; si es anterior al consultado, se heredó
    from:       string;
    // Negativo si ya se pasó
    remaining:  number;
    // Puede superar 100
    percentage: number;
}

// Total personal de un mes y el presupuesto que regía (null si no había)
export interface PersonalMonthTotal {
    month:  string;
    total:  number;
    budget: number | null;
}
