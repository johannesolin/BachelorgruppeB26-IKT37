import { getProductById } from "@/db/actions"

export async function GET( req: Request ){    
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId")?.trim() ?? "";    
    
    const result = await getProductById(productId);

    return Response.json(result[0])
}