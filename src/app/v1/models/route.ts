import { NextResponse } from 'next/server';

// Standard Puter AI models as of now
const PUTER_MODELS = [
    { id: 'gpt-4o', object: 'model', created: 1715644800, owned_by: 'openai' },
    { id: 'gpt-4o-mini', object: 'model', created: 1721260800, owned_by: 'openai' },
    { id: 'claude-3-5-sonnet', object: 'model', created: 1718841600, owned_by: 'anthropic' },
    { id: 'claude-3-haiku', object: 'model', created: 1709510400, owned_by: 'anthropic' },
    { id: 'meta-llama-3-70b-instruct', object: 'model', created: 1713436800, owned_by: 'meta' },
    { id: 'meta-llama-3-8b-instruct', object: 'model', created: 1713436800, owned_by: 'meta' },
];

export async function GET() {
    return NextResponse.json({
        object: 'list',
        data: PUTER_MODELS
    });
}
