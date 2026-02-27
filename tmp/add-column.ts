import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function main() {
    try {
        console.log('Adding creatorToken column...');
        const client = await pool.connect();
        await client.query('ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "creatorToken" TEXT;');
        // Update existing rows with a random uuid if needed
        await client.query('UPDATE "proposals" SET "creatorToken" = gen_random_uuid() WHERE "creatorToken" IS NULL;');
        console.log('Done!');
        client.release();
    } catch (err: any) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

main();
