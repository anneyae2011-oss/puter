import { NextResponse } from 'next/server';
import fallbackModels from '@/lib/models_fallback.json';

export async function GET() {
    try {
        // We use the static fallback as the primary source for reliability on Vercel
        // This ensures the dropdown always contains all 427 Puter models.
        const data = fallbackModels.map((id: string) => ({
            id: id,
            object: 'model',
            created: Math.floor(Date.now() / 1000),
            owned_by: id.includes(':') ? id.split(':')[0] : 'puter',
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
