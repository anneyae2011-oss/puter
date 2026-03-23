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
        const response = await puter.ai.chat(messages, { model });

        console.log('Puter Response:', JSON.stringify(response, null, 2));

        // Map back to OpenAI format
        let content = '';
        if (typeof response === 'string') {
            content = response;
        } else if (response && (response as any).message) {
            const msgContent = (response as any).message.content;
            if (Array.isArray(msgContent)) {
                content = msgContent.map(part => typeof part === 'string' ? part : JSON.stringify(part)).join('');
            } else if (typeof msgContent === 'string') {
                content = msgContent;
            } else {
                content = JSON.stringify(msgContent);
            }
        } else if (response && (response as any).content) {
            content = typeof (response as any).content === 'string' 
                ? (response as any).content 
                : JSON.stringify((response as any).content);
        } else {
            content = JSON.stringify(response);
        }

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
                        content: content || '',
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
