import { DBSQLClient } from "@databricks/sql";
import 'server-only';

export async function getDatabricksClient() {
    const client = new DBSQLClient();

    const host = process.env.DATABRICKS_SERVER_HOSTNAME;
    const path = process.env.DATABRICKS_HTTP_PATH;
    const token = process.env.DATABRICKS_TOKEN;

    if (!host || !path || !token) {
        throw new Error('Missing Databricks env vars. Ensure DATABRICKS_SERVER_HOSTNAME, DATABRICKS_HTTP_PATH and DATABRICKS_TOKEN are set');
    } 

    await client.connect({ host, path, token});

    return client;
}

export async function executeQuery(query: string, q: string) {
    const client = await getDatabricksClient();
    const session = await client.openSession();
    try {
        const operation = await session.executeStatement(query, { 
            runAsync: true,
            namedParameters: {
                param: q
            }
        });
        const result = await operation.fetchAll();
        await operation.close();
        return result;
    } finally {
        await session.close();
    }
}
