import { Quality, Size } from "@/openAi/types";

export async function POST( req: Request) {
    try{
        const form = await req.formData();

        const prompt = String(form.get("prompt") ?? "").trim();
        const size = String(form.get("size") ?? "").trim() as Size;
        const quality = String(form.get("quality") ?? "").trim() as Quality;
    }
    
}