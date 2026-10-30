export interface MonthSummaryResponse {
    month:            string;
    total:            number;
    totalWithoutRent: number;
    rent:             number;
    fixedTotal:       number;
    variableTotal:    number;
    payments:         PaymentSummary;
    people:           PersonSummary[];
    categories:       CategorySummary[];
}

export interface PaymentSummary {
    paid:     number;
    pending:  number;
    progress: number;
}

export interface PersonSummary {
    personId:     string;
    name:         string;
    contribution: number;
    share:        number;
    percentage:   number;
    total:        number;
    fixed:        number;
    variable:     number;
    paid:         number;
    pending:      number;
}

export interface CategorySummary {
    category:   string;
    name:       string;
    color:      string;
    amount:     number;
    percentage: number;
}

// Total de un mes para el gráfico de gasto mensual
export interface MonthTotal {
    month:    string;
    total:    number;
    // Arriendo y costos fijos
    fixed:    number;
    variable: number;
}
