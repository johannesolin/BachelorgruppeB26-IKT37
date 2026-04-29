import 'server-only';
import { DBSQLClient } from "@databricks/sql";
import { Q } from "./types";
import { base64ToBuffer } from '@/lib/helperFunctions/base64ToBuffer';

function getEnvVariables(){
    const host = process.env.DATABRICKS_SERVER_HOSTNAME;
    const path = process.env.DATABRICKS_HTTP_PATH;
    const token = process.env.DATABRICKS_TOKEN;

    return { host, path, token };
}

async function createClient(): Promise<DBSQLClient> {
    try{
        const client= new DBSQLClient();

        const { host,  path, token } = getEnvVariables();

        if (!host || !path || !token) {
            throw new Error('Missing Databricks env vars. Ensure DATABRICKS_SERVER_HOSTNAME, DATABRICKS_HTTP_PATH and DATABRICKS_TOKEN are set');
        }
        await client.connect({ host, path, token });
        return client;
    } catch (e){
        throw new Error("Could not create session, error: " + e);
    }    
}

export async function executeQuery(query: string, q: Q) {
    try {
        const client = await createClient();
        const session = await client.openSession();
        const operation = await session.executeStatement(query, { 
            runAsync: true,
            namedParameters: q
        });
        const result = await operation.fetchAll();
        await session.close();
        await client.close();
        return result;
    } catch (e){
        throw new Error("Could not execute query" + e);
    }
}

export async function postImage(imageString: string, volumePath: string){
    try{
        const { host, token } = getEnvVariables();
        const url = `https://${host}/api/2.0/fs/files${volumePath}`;

        const {buffer, fileType} = base64ToBuffer(imageString);
        const body = new Uint8Array(buffer);

        const request = await fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": fileType,
            },
            body,
        });
        
        if(!request.ok){
            const text = await request.text();
            throw new Error(`Ìmage upload failed ${request.status} ${text}`);
        }

        return true;

    } catch (e){
        throw new Error(`Image upload failed ${e}`);
    }

}