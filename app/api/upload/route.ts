import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, BUCKET_NAME } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';



export async function POST(request: NextRequest) {
    try {
        console.log('[POST /api/upload] Received upload request');
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const slug = formData.get('slug') as string | null;
        const creatorToken = request.headers.get('x-creator-token');

        console.log(`[POST /api/upload] Bucket: ${BUCKET_NAME}, Slug: ${slug}, CreatorToken: ${creatorToken ? 'present' : 'missing'}`);

        if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

        const proposal = await prisma.proposal.findUnique({ where: { slug } });
        if (!proposal) {
            console.error(`[POST /api/upload] Proposal not found for slug: ${slug}`);
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        if (proposal.creatorToken !== creatorToken) {
            console.error(`[POST /api/upload] Unauthorized: Token mismatch. Expected: ${proposal.creatorToken}, Received: ${creatorToken}`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!file) {
            console.error('[POST /api/upload] No file provided');
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log(`[POST /api/upload] Processing file: ${file.name} (${file.type})`);

        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!allowed.includes(ext)) {
            console.error(`[POST /api/upload] Invalid file type: ${ext}`);
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${slug}/${uuidv4()}.${ext}`;
        console.log(`[POST /api/upload] Uploading to Supabase: ${fileName}`);

        const { error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error('[POST /api/upload] Supabase upload error:', error);
            return NextResponse.json({ error: 'Upload failed', details: error }, { status: 500 });
        }

        const { data } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        console.log(`[POST /api/upload] Upload successful: ${data.publicUrl}`);
        return NextResponse.json({ imageUrl: data.publicUrl });
    } catch (error) {
        console.error('[POST /api/upload] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
