import IDBSQLSession from "@databricks/sql/dist/contracts/IDBSQLSession";

export type SessionInfo = {
    session: IDBSQLSession;
    created: number;
    timeout: number;
    close?: NodeJS.Timeout | null;
}