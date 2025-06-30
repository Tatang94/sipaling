import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Configure database connection
if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not found, will use in-memory storage");
}

let pool: Pool | null = null;
let db: any = null;

try {
  if (process.env.DATABASE_URL) {
    neonConfig.webSocketConstructor = ws;
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log("Database connection configured successfully");
  }
} catch (error) {
  console.warn("Database connection failed, falling back to in-memory storage:", error);
}

export { pool, db };