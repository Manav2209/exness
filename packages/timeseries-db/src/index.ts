import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const globalForPool = globalThis;
const connectionString = process.env.DATABASE_URL1 || "postgresql://postgres:postgres@localhost:5433/timeseries_db";


// @ts-ignore
const pool = globalForPool.pool || new pg.Pool({connectionString,
    ssl: false, 
    max: 10, // limit connections per worker
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// @ts-ignore
if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;

export { pool };