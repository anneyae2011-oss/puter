import { NextRequest, NextResponse } from 'next/server';
import puter from '@/lib/puter';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { model, messages, stream } = body;

        if (!model || !messages) {
            return NextResponse.json({ error: 'Model and messages are required' }, { status: 400 });
        }

        // Authenticate the request using WandererTrade key if needed?
        // the user said: "wanderertrade's api key: enyapeakshit"
        // typically this would be in the header: Authorization: Bearer enyapeakshit
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (token !== process.env.WANDERERTRADE_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized. Invalid WandererTrade API Key.' }, { status: 401 });
        }

        // Puter AI Chat Call
        // Correct signature: puter.ai.chat(messages, options)
        const response = await puter.ai.chat(messages, { model });

        // Map back to OpenAI format
        // response is a ChatResponse object which has { message: { role, content } }
        const content = typeof response === 'string' 
            ? response 
            : (response as any).message?.content || (response as any).content || JSON.stringify(response);

        return NextResponse.json({
            id: `chatcmpl-${Math.random().toString(36).substring(7)}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: content,
                    },
                    finish_reason: 'stop',
                },
            ],
            usage: {
                prompt_tokens: -1,
                completion_tokens: -1,
                total_tokens: -1,
            },
        });
    } catch (error: any) {
        console.error('Puter API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
