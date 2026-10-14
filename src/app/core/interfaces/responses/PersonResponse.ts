export interface PersonResponse {
    id:           string;
    name:         string;
    contribution: number;
    share:        number;
    percentage:   number;
    createdOn:    string;
    updatedOn:    string | null;
}

export interface PeopleResponse {
    totalContribution: number;
    items:             PersonResponse[];
}

export interface PersonAmount {
    personId: string;
    name:     string;
    amount:   number;
    // true si la parte de esta persona ya está cubierta
    paid:     boolean;
}
