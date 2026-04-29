export interface ProductImage {
    category: string;
    height: number;
    href: string;
    width: number;
}

export interface Product {
    productId: number;
    name: string;
    categoryName: string;
    images: ProductImage[];
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