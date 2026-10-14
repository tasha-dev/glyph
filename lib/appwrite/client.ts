import { Account, Client, TablesDB } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!;
const TABLE_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_TABLE_ID!;

if (!endpoint || !projectId) {
  throw new Error("Missing Appwrite public environment variables");
}

const client = new Client().setEndpoint(endpoint).setProject(projectId);
const account = new Account(client);
const tablesDB = new TablesDB(client);

export { client, account, tablesDB, DATABASE_ID, TABLE_ID };
