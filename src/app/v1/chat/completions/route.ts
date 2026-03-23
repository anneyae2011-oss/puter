import { NextRequest, NextResponse } from 'next/server';
import { puterFetch } from '@/lib/puter';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { model, messages, stream } = body;

        if (!model || !messages) {
            return NextResponse.json({ error: 'Model and messages are required' }, { status: 400 });
        }

        // Authenticate the request using WandererTrade key
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (token !== process.env.WANDERERTRADE_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized. Invalid WandererTrade API Key.' }, { status: 401 });
        }

        // Puter AI Chat Call (Direct Driver Call)
        console.log(`Calling Puter AI: model=${model}, stream=${!!stream}`);
        
        try {
            const result = await puterFetch({
                interface: 'puter-chat-completion',
                driver: 'ai-chat',
                method: 'complete',
                args: {
                    messages,
                    model,
                    stream: stream === true,
                },
            });

            // Map back to OpenAI format
            // puterFetch result is the "result" field from the SDK internal call
            let content = '';
            if (result && result.message) {
                const msgContent = result.message.content;
                if (Array.isArray(msgContent)) {
                    content = msgContent.map((part: any) => typeof part === 'string' ? part : (part.text || JSON.stringify(part))).join('');
                } else {
                    content = msgContent || '';
                }
            } else if (typeof result === 'string') {
                content = result;
            } else {
                content = JSON.stringify(result);
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
                usage: result.usage || {
                    prompt_tokens: -1,
                    completion_tokens: -1,
                    total_tokens: -1,
                },
            });
        } catch (apiError: any) {
            console.error('Puter Upstream Error:', apiError);
            return NextResponse.json({ error: apiError.message || 'Puter API Error' }, { status: 502 });
        }
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
