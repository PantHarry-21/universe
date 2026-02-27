import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function testStorage() {
    console.log('Testing Supabase Storage connection...');
    console.log('URL:', supabaseUrl);

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log('Fetching buckets...');
        const { data, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error('Error listing buckets:', error);
            return;
        }

        console.log('Buckets found:', data.map(b => b.name));

        const bucketName = process.env.SUPABASE_BUCKET || 'memories';
        const exists = data.find(b => b.name === bucketName);

        if (exists) {
            console.log(`Bucket "${bucketName}" exists!`);
        } else {
            console.log(`Bucket "${bucketName}" NOT found. Creating it...`);
            const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true
            });

            if (createError) {
                console.error('Error creating bucket:', createError);
            } else {
                console.log('Bucket created successfully:', createData);
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testStorage();
