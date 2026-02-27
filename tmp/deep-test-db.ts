import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Setup environment
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString ? connectionString.split('@')[1] : 'UNDEFINED');

const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
});

async function test() {
    try {
        console.log('1. Attempting to connect to pool...');
        const client = await pool.connect();
        console.log('   Pool connected successfully.');
        client.release();

        console.log('2. Testing Prisma with adapter...');
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        const count = await prisma.proposal.count();
        console.log('   Prisma success! Proposal count:', count);

        await prisma.$disconnect();
    } catch (err: any) {
        console.error('FAILED:', err.message);
        if (err.code) console.error('Error Code:', err.code);
    } finally {
        await pool.end();
    }
}

test();
