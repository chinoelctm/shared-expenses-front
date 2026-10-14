export interface CategoryResponse {
    id:     string;
    name:   string;
    // Color #rrggbb
    color:  string;
    // true si no se puede eliminar (la usa el arriendo de cada mes)
    locked: boolean;
}
