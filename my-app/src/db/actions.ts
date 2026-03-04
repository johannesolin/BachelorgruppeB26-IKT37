import { executeQuery } from "./db";

export async function getProductById(q: string){
    try{
        const data = await executeQuery('SELECT productId, name, categoryName, images FROM prod_analytics.student_2026.products WHERE productId = :param',q);
        if(!data){
            throw new Error("No results returned");
        }
        return data;
    } catch (error){
        throw new Error('Error getting product' + error)
    }
}