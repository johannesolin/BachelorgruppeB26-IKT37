import 'server-only';
import { executeQuery } from "./db";
import { Product, PromptResultsProps } from './types';


export async function getProductById(q: string): Promise<Product[]>{
    try{
        const data = await executeQuery('SELECT productId, name, categoryName, images FROM prod_analytics.student_2026.products WHERE productId = :param',q);
        if(!data){
            throw new Error("No results returned");
        }
        return data as Product[];
    } catch (error){
        throw new Error('Error getting product' + error)
    }
}

export async function postPromptResults( props: PromptResultsProps ) {
    console.log(props);
}