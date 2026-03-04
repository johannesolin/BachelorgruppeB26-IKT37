import { DBSQLClient } from "@databricks/sql";
import 'server-only';
import { SessionInfo } from "./types";

const sessionStore: {[key: string]: SessionInfo} = {};

const IDLE_CLOSE = 2*60*1000;
const MAX_LIFETIME = 60*60*1000;

async function createSession(): Promise<SessionInfo> {
    const client = new DBSQLClient();

    const host = process.env.DATABRICKS_SERVER_HOSTNAME;
    const path = process.env.DATABRICKS_HTTP_PATH;
    const token = process.env.DATABRICKS_TOKEN;

    if (!host || !path || !token) {
        throw new Error('Missing Databricks env vars. Ensure DATABRICKS_SERVER_HOSTNAME, DATABRICKS_HTTP_PATH and DATABRICKS_TOKEN are set');
    }

    try {
        await client.connect({ host, path, token});
        const session = await client.openSession();
        const returnSession: SessionInfo = {session: session, created: Date.now(), timeout: Date.now()}
        scheduleClose(returnSession, IDLE_CLOSE);
        return returnSession;
    } catch (error) {
        throw new Error("Could not create session, error: " + error)
    }    
}

async function getOrCreateSession(): Promise<SessionInfo> {
    const session = sessionStore["default"]
    if(session) {
        if(Date.now() - session.created > MAX_LIFETIME){
            await closeSession(session);
        } else if(Date.now() - session.timeout < IDLE_CLOSE){
            session.timeout = Date.now();
            cancelScheduledClose(session);
            scheduleClose(session, IDLE_CLOSE);
            return session;
        }
    }
    const newSession = await createSession();
    sessionStore["default"] = newSession;
    return newSession;
}

export async function executeQuery(query: string, q: string) {
    const {session} =  await getOrCreateSession();
    try {
        const operation = await session.executeStatement(query, { 
            runAsync: true,
            namedParameters: {
                param: q
            }
        });
        const result = await operation.fetchAll();
        return result;
    } catch (error){
        console.log("Could not execute query", error);
    }
}

function scheduleClose(session: SessionInfo, time: number){
    if (session.close) {
        clearTimeout(session.close);
        session.close = null;
    }
    session.close = setTimeout(async () => {
        const cur = sessionStore["default"];
        console.log("test")
        if(cur && !(cur instanceof Promise) && cur.session === session.session) {            
            await closeSession(session);
        }
    }, time)
}

async function closeSession(session: SessionInfo): Promise<void>{
    try {
        await session.session.close();
        console.log("session closed")
    } catch (error) {
        console.warn("Error closing session", error);
    }
    delete sessionStore["default"];
}

function cancelScheduledClose(session: SessionInfo) {
  if (session.close) {
    clearTimeout(session.close);
    session.close = null;
  }
}