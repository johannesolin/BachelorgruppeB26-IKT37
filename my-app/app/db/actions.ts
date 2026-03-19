import { executeQuery } from "./db";

export async function getProductById(q: string){
    try{
    const data = await executeQuery('SELECT productId, name, categoryName, images FROM prod_analytics.student_2026.products WHERE productId = :param',q);
    return data;
    } catch (e){
        console.error('Error geting product', e)
        return [];
    }
}