export interface SettingsRequest {
    defaultRent: number;
    fixedCosts:  FixedCostRequest[];
}

export interface FixedCostRequest {
    description: string;
    amount:      number;
    category:    string;
}
