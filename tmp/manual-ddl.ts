import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
});

const ddl = `
CREATE TABLE IF NOT EXISTS "proposals" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "passcodeHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "proposals_slug_key" ON "proposals"("slug");

CREATE TABLE IF NOT EXISTS "memories" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "constellationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "date" TIMESTAMP(3),
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "memories_proposalId_constellationId_key" ON "memories"("proposalId", "constellationId");

ALTER TABLE "memories" DROP CONSTRAINT IF EXISTS "memories_proposalId_fkey";
ALTER TABLE "memories" ADD CONSTRAINT "memories_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;

async function main() {
    try {
        console.log('Connecting to database for manual DDL...');
        const client = await pool.connect();
        console.log('Connected! Running DDL...');
        await client.query(ddl);
        console.log('DDL executed successfully! Tables Created.');
        client.release();
    } catch (err: any) {
        console.error('DDL Error:', err.message);
    } finally {
        await pool.end();
    }
}

main();
