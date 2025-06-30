import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Configure database connection with Replit PostgreSQL
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=require`;

let pool: Pool | null = null;
let db: any = null;

try {
  if (DATABASE_URL && (process.env.PGHOST || DATABASE_URL.includes('neon.tech'))) {
    neonConfig.webSocketConstructor = ws;
    pool = new Pool({ connectionString: DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log("Database connection configured successfully with PostgreSQL");
  } else {
    console.log("DATABASE_URL not found, will use in-memory storage");
  }
} catch (error) {
  console.warn("Database connection failed, falling back to in-memory storage:", error);
}

export { pool, db };