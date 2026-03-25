import { Template } from "@/templates/types";
import { Product } from "../db/types";

export interface SelectProductCardProps {
    selectedProducts: Product[];
    moveProduct: (param: number, param2: -1 | 1 ) => void;
    removeProduct: (param: number) => void;
}

export interface EnvironmentCardProps {
    templateId: string;
    setTemplateId: (param: string) => void;
    templates: Template[];
    generateScene: () => void;
    darkMode: boolean;
    sceneUrl: string;
    busyScene: boolean;
    busyGen: boolean;
    sceneFixPrompt: string;
    setSceneFixPrompt: (param: string) => void;
    refineScene: () => void;
}