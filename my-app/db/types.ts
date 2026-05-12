export interface ProductImage {
    category: string;
    height: number;
    href: string;
    width: number;
}

export interface ListProduct {
    productId: number;
    name: string;
    areaName: string;
    categoryName: string;
    assortmentClassName: string;
    images: ProductImage[];
}

export interface Product extends ListProduct {
    selectedImage: number; 
}

export type Q = {
    [key: string]: string;
}

export interface PostEnviromentResultsProps {
    id: string;
    prompt: string;
    category: string;
    imageString: string;
    model: "gpt-image-1.5" | "" | "flux-2-pro";
}

export interface PromptResultsProps {
    id: string;
    productNames: Array<string>;
    productIds: Array<number>;
    imageLink: string;
    model: string;
    prompt: string;
}

export interface GetProductByCategoryProps {
    area: string;
    category: string;
    assortment: string;
}

export interface EnvironmentResultRecord {
    id: string;
    created: string;
    imagelink: string;
    selected_model: string;
    category: string;
    prompt: string;
}

export interface ProductPlacementResultRecord {
    id: string;
    created: string;
    imagelink: string;
    selected_model: string;
    product_names: string;
    product_ids: string;
    prompt: string;
}

export interface SavedPrompt {
    id: string;
    created: string;
    prompt: string;
    model: string;
    prompt_type: string;
}

