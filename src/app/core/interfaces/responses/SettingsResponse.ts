export interface SettingsResponse {
    defaultRent: number;
    fixedCosts:  FixedCostResponse[];
    createdOn:   string;
    updatedOn:   string | null;
}

export interface FixedCostResponse {
    description:  string;
    amount:       number;
    category:     string;
    categoryName: string;
}
