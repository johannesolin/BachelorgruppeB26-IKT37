import 'server-only';
import { executeQuery, postImage } from "./db";
import { GetProductByCategoryProps, ListProduct, PostEnviromentResultsProps, Product, PromptResultsProps } from './types';

// funksjon for søk etter produkt på produkt ID
export async function getProductById(q: string): Promise<Product[]>{
    try{
        const data = await executeQuery('SELECT productId, name, areaName, categoryName, assortmentClassName, images FROM prod_analytics.student_2026.products WHERE productId = :param', {param:  q});
        if(!data){
            throw new Error("No results returned");
        }
        return data as Product[];
    } catch (error){
        throw new Error('Error getting product' + error)
    }
}

// funksjon for produkt søk etter kategorier
export async function getProductByCategory(props: GetProductByCategoryProps): Promise<ListProduct[]>{
    try{        
        let sqlQuery = "SELECT productId, name, areaName, categoryName, assortmentClassName, images FROM prod_analytics.student_2026.products";
        if(props.area && props.area.length > 0) sqlQuery = sqlQuery + " WHERE (areaName = :area)";
        if(props.category && props.category.length > 0) sqlQuery = sqlQuery + " AND (categoryName = :category)";
        if(props.assortment && props.assortment.length > 0) sqlQuery = sqlQuery + " AND (assortmentClassName = :assortment)";

        const parameters = {
            ...(props.area && props.area.length > 0 && { area: props.area }),
            ...(props.category && props.category.length > 0 && { category: props.category }),
            ...(props.assortment && props.assortment.length > 0 && { assortment: props.assortment }),
        };

        const data = await executeQuery(sqlQuery, parameters);

        if(!data) throw new Error("Problem getting products from database with product category search");

        return data as ListProduct[];

    } catch (e){
        throw new Error("Error getting products " + e);
    }
    
}

// funksjon for lagring av miljøbilde og inforamsjon 
export async function postEnvironmentResult( props: PostEnviromentResultsProps ) {
    try{
        const imageLink = `/Volumes/prod_analytics/student_2026/prompt_results/environment/${props.id}.jpg`
        const imageResult = await postImage(props.imageString, imageLink);    
        if(!imageResult) throw new Error(`Problem while storing enviroment image.`);

        const parameters = {
                id: props.id,
                imagelink: imageLink,
                selected_model: props.model, 
                category: props.category, 
                prompt: props.prompt,
        };

        const sqlResult = await executeQuery("INSERT INTO prod_analytics.student_2026.enviroment_results (id, created, imagelink, selected_model, category, prompt) VALUES (:id, current_timestamp(), :imagelink, :selected_model, :category, :prompt)", 
            parameters);

        if(!sqlResult) throw new Error("Problem while storing enviroment SQL results.");
        
            return true;        

    } catch (e){
        throw new Error(`Error storing enviroment results ${e}`);
    }
}

// funksjon for lagring av miljøbilde med produkt placering og inforamsjon 
export async function postPromptResults( props: PromptResultsProps ) {
    try{
        const imageLink = `/Volumes/prod_analytics/student_2026/prompt_results/productPlacment/${props.id}.jpg`
        const imageResult = await postImage(props.imageLink, imageLink);

        if(!imageResult) throw new Error(`Problem while storing product placement image.`);

        const parameters = {
                id: props.id,
                imagelink: imageLink,
                selected_model: props.model, 
                product_names: JSON.stringify(props.productNames),
                product_ids: JSON.stringify(props.productIds), 
                prompt: props.prompt,
        };

        const sqlResult = await executeQuery("INSERT INTO prod_analytics.student_2026.product_placement_results (id, created, imagelink, selected_model, product_names, product_ids, prompt) VALUES (:id, current_timestamp(), :imagelink, :selected_model, :product_names, :product_ids, :prompt)", 
            parameters);

        if(!sqlResult) throw new Error("Problem while storing product placment SQL results.");
        
            return true;

    } catch (e){
        throw new Error(`Error storing product placement results ${e}`);
    }
}