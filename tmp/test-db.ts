import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
    try {
        console.log('Testing database connection with Prisma 7 adapter...');
        const count = await prisma.proposal.count();
        console.log('Proposal count:', count);

        const slug = 'test-slug-' + Date.now();
        const passcode = '1234';
        const passcodeHash = await bcrypt.hash(passcode, 12);

        console.log('Attempting to create a test proposal...');
        const proposal = await prisma.proposal.create({
            data: {
                slug,
                title: 'Test Title',
                passcodeHash
            },
        });
        console.log('Successfully created proposal:', proposal.slug);
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
