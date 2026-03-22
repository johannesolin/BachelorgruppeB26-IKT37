import { Product } from "./dbTypes";

export interface SelectProductCardProps {
    selectedProducts: Product[];
    moveProduct: (param: number, param2: -1 | 1 ) => void;
    removeProduct: (param: number) => void;
}