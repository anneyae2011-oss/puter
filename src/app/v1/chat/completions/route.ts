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
            const response = await puterFetch({
                interface: 'puter-chat-completion',
                driver: 'ai-chat',
                method: 'complete',
                args: {
                    messages,
                    model,
                    stream: stream === true,
                },
            });

            // Read the entire response as text
            // Note: Puter's direct drivers/call returns NDJSON (one JSON object per line)
            // when streaming is enabled OR for some success/result envelopes.
            const rawText = await response.text();
            
            // Split by lines and parse each valid JSON block
            const lines = rawText.split('\n').filter(l => l.trim() !== '');
            let content = '';
            let usage = { prompt_tokens: -1, completion_tokens: -1, total_tokens: -1 };

            for (const line of lines) {
                try {
                    const chunk = JSON.parse(line);
                    
                    // Case 1: Standard drivers/call result envelope (non-streaming)
                    if (chunk.success && chunk.result) {
                        const result = chunk.result;
                        if (result.message && result.message.content) {
                            content = result.message.content;
                        }
                        if (result.usage) usage = result.usage;
                    } 
                    // Case 2: Streaming chunk {"type":"text","text":"..."}
                    else if (chunk.type === 'text') {
                        content += chunk.text || '';
                    }
                    // Case 3: Streaming usage chunk {"type":"usage","usage":{...}}
                    else if (chunk.type === 'usage' && chunk.usage) {
                        usage = chunk.usage;
                    }
                    // Case 4: Raw result object (unpacked by puterFetch previously, but now we get raw response)
                    else if (chunk.message && chunk.message.content) {
                        content = chunk.message.content;
                        if (chunk.usage) usage = chunk.usage;
                    }
                } catch (e) {
                    console.warn('Failed to parse NDJSON line:', line, e);
                }
            }

            // Return as standard OpenAI JSON response
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
                usage: usage,
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
