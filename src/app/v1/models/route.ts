import { NextResponse } from 'next/server';
import getPuter from '@/lib/puter';

export async function GET() {
    try {
        const puter = getPuter();
        // Use deduplicate: false to get the full list of 500+ models from all providers
        const models = await puter.ai.listModels({ deduplicate: false });
        
        // Transform Puter models to OpenAI format
        const data = (models as any[]).map((m: any) => ({
            id: m.key || m.id,
            object: 'model',
            created: Math.floor(Date.now() / 1000),
            owned_by: m.provider || 'puter',
        }));

        return NextResponse.json({
            object: 'list',
            data: data,
        });
    } catch (error: any) {
        console.error('Models API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
