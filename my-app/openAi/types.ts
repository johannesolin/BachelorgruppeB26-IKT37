export type Size = "1024x1024" | "1024x1536" | "1536x1024";

export type Quality = "low" | "medium" | "high";

export interface GenerateImg {
    prompt: string;
    n: number;
    size?: Size;
    quality?: Quality;   
}

export interface EditImg extends GenerateImg {
    images: Buffer;
}