import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, BUCKET_NAME } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export const config = { api: { bodyParser: false } };

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const slug = formData.get('slug') as string | null;
        const creatorToken = request.headers.get('x-creator-token');

        if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

        const proposal = await prisma.proposal.findUnique({ where: { slug } });
        if (!proposal || proposal.creatorToken !== creatorToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!allowed.includes(ext)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${slug || 'shared'}/${uuidv4()}.${ext}`;

        const { error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error('[Upload Supabase error]', error);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }

        const { data } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return NextResponse.json({ imageUrl: data.publicUrl });
    } catch (error) {
        console.error('[POST /api/upload]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
