import IDBSQLSession from "@databricks/sql/dist/contracts/IDBSQLSession";

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

export type SessionInfo = {
    session: IDBSQLSession;
    created: number;
    timeout: number;
    close?: NodeJS.Timeout | null;
}

export interface PromptResultsProps {
    id: string;
    created: Date;
    productNames: Array<string>;
    productIds: Array<number>;
    imageLink: string;
    model: string;
    miljoPrompt: string;
    miljoEditPrompts: Array<string>;
    imagePrompt: string;
    imageEditPrompts: Array<string>;
}