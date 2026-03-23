import { NextResponse } from 'next/server';
import puter from '@/lib/puter';

export async function GET() {
    try {
        const models = await puter.ai.listModels();
        
        // Transform Puter models to OpenAI format
        const data = (models as any[]).map((m: any) => ({
            id: m.key || m.id,
            object: 'model',
            created: Math.floor(Date.now() / 1000), // Approximate
            owned_by: m.provider || 'puter'
        }));

        return NextResponse.json({
            object: 'list',
            data: data
        });
    } catch (error: any) {
        console.error('Puter Model Listing Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
