import { PlacementPreset, Template } from "@/templates/types";
import { Product } from "../db/types";

export interface ProductCardProps {
    product: Product;
    selectedProducts: Product[];
    index: number;
    moveProduct: (param: number, param2: -1 | 1 ) => void;
    removeProduct: (param: number) => void;
    changeSelectedImage: (param: number, param2: number) => void;
}

export interface EnvironmentCardProps {
    templateId: string;
    setTemplateId: (param: string) => void;
    templates: Template[];
    generateScene: () => void;
    darkMode: boolean;
    sceneUrl: string;
    busyGen: boolean;
    busyScene: boolean;
    busyPlacement: boolean;
    sceneFixPrompt: string;
    setSceneFixPrompt: (param: string) => void;
    refineScene: () => void;
    selectedModel: string;
    setSelectedModel: ( param: string ) => void;
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
    busyScene: boolean;
    busyPlacement: boolean;
    placementPresets: PlacementPreset[];
    selectedPlacementPreset: string;
    setSelectedPlacementPreset: ( param: string ) => void;
    getPlacementSuggestion: () => void;
}

export interface SelectProductByIdCardProps {
    productIdInput: string;
    setProductIdInput: ( param: string ) => void;
    darkMode: boolean;
    addProductId: () => void;
    selectedProducts: Product[];    
}