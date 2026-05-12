import { Template } from "@/templates/types";
import { ListProduct, Product } from "../db/types";

// interface/type til produkt kort component på hovedsiden
export interface ProductCardProps {
    product: Product;
    selectedProducts: Product[];
    index: number;
    moveProduct: (param: number, param2: -1 | 1 ) => void;
    removeProduct: (param: number) => void;
    changeSelectedImage: (param: number, param2: number) => void;
    darkMode: boolean;
}

// type til miljøkort component på hovedsiden
export interface EnvironmentCardProps {
    templateId: string;
    setTemplateId: (param: string) => void;
    templates: Template[];
    scenePrompt: string;
    setScenePrompt: ( param: string) => void;
    generateScene: () => void;
    darkMode: boolean;
    sceneUrl: string;
    busyGen: boolean;
    busyDatabase: boolean;
    sceneFixPrompt: string;
    setSceneFixPrompt: (param: string) => void;
    refineScene: () => void;
    selectedModel: string;
    setSelectedModel: ( param: "gpt-image-1.5" | "" | "flux-2-pro" ) => void;
    storeEnviromentResult: () => void;
    enviromentCategory: "Uteplass/terasse" | "Uteplass/gressplen" | "Stue" | "";
    setEnviromentCategory: (param: "Uteplass/terasse" | "Uteplass/gressplen" | "Stue" | "") => void;
}

export interface ResultsCardProps {
    darkMode: boolean;
    resultDataUrls: string[];
    selectedVariant: number;
    setSelectedVariant: (param: number) => void; 
}

export interface PlacementCardProps {
    placementPrompt: string;
    setPlacementPrompt: ( param: string ) => void;
    darkMode: boolean;
    variants: number;
    setVariants: ( param: number ) => void;
    placeProductsInScene: () => void;
    busyGen: boolean;
    selectedProducts: Product[];
    selectedModel: "gpt-image-1.5" | "flux-2-pro" | "";
    scenePrompt: string;    
    getPlacementSuggestion: () => void;
}

export interface SelectProductByIdCardProps {
    productIdInput: string;
    setProductIdInput: ( param: string ) => void;
    darkMode: boolean;
    addProductId: () => void;
    selectedProducts: Product[];
    busyDatabase: boolean;
    setSearchModalState: (param: boolean) => void; 
}

export interface EditResultCardProps {
    darkMode: boolean;
    editResultPrompt: string;
    setEditResultPrompt : ( param: string ) => void;
    busyGen: boolean;
    selectedModel: string;
    editFinalImage: () => void;
    resultDataUrls: string[];
}

export interface LoadingModalProps {
    busyGen: boolean;
    darkMode: boolean;
    selectedModel: "gpt-image-1.5" | "flux-2-pro" | "";
    estimatedSeconds?: number;
}

export interface StoringModalProps {
    busyDatabase: boolean;
    darkMode: boolean;
}

export interface ProductSearchModalProps {
    searchModalState: boolean;
    darkMode: boolean;
    productCategoryList: Product[] | [];
    setSeachModalState: (param: boolean) => void;
    productCategoriSearch: (param: string | undefined, param2: string | undefined, param3: string | undefined) => void;
    addProductFromCategorySearch: ( param: ListProduct) => void;
    selectedProducts: Product[] | [];
}

export interface Option {
    value: string;
    label: string;
}

export interface SearchSelectProps {
    darkMode: boolean;
    options: Option[];
    selectedValue: Option | null;
    setSelectedValue: ( param: Option | null ) => void;
}

export interface ProductListProps {
    filteredProductList: Product[] | [];
    darkMode: boolean;
    addProductFromCategorySearch: ( param: ListProduct) => void;
    selectedProducts: Product[] | [];
}

// interfaces for profil-side sub-komponenter
export interface ModelPropertyRowProps {
    icon: string;
    label: string;
    value: string;
    dark: boolean;
}

export interface ModelPricingSectionProps {
    dark: boolean;
    rows: { label: string; price: string }[];
}

export interface ProfilResultCardProps {
    imagelink: string;
    prompt: string;
    model: string;
    meta: string;
    created: string;
    dark: boolean;
    onDelete?: () => Promise<void>;
}

export interface ProfilPromptRowProps {
    prompt: string;
    model: string;
    type: string;
    created: string;
    dark: boolean;
    onDelete?: () => Promise<void>;
}

export interface ModelCardProps {
    icon: string;
    name: string;
    provider: string;
    badgeVariant: "blue" | "purple";
    description: string;
    properties: Array<{ icon: string; label: string; value: string }>;
    pricingRows: Array<{ label: string; price: string }>;
    dark: boolean;
}