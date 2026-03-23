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
            const rawText = await response.text();
            console.log('UPSTREAM RAW RESPONSE:', rawText.substring(0, 1000));
            
            // Split by lines and parse each valid JSON block
            const lines = rawText.split('\n').filter(l => l.trim() !== '');
            let content = '';
            let usage = { prompt_tokens: -1, completion_tokens: -1, total_tokens: -1 };

            for (const line of lines) {
                try {
                    const chunk = JSON.parse(line);
                    
                    // Case 1: Standard drivers/call result envelope (non-streaming)
                    // e.g. {"success":true,"result":{"message":{"content":"..."}}}
                    if (chunk.success === true && chunk.result) {
                        const resultData = chunk.result;
                        const msgObj = resultData.message;
                        if (msgObj && msgObj.content) {
                            const c = msgObj.content;
                            content = Array.isArray(c) 
                                ? c.map((p: any) => typeof p === 'string' ? p : (p.text || JSON.stringify(p))).join('')
                                : c.toString();
                        }
                        if (resultData.usage) usage = resultData.usage;
                    } 
                    // Case 2: Streaming chunk {"type":"text","text":"..."}
                    // e.g. Puter streaming format
                    else if (chunk.type === 'text') {
                        content += chunk.text || '';
                    }
                    // Case 3: Streaming usage chunk {"type":"usage","usage":{...}}
                    else if (chunk.type === 'usage' && chunk.usage) {
                        usage = chunk.usage;
                    }
                    // Case 4: Raw result object (sometimes returned by specific drivers directly)
                    else if (chunk.message && chunk.message.content) {
                        const c = chunk.message.content;
                        // Avoid overwriting cumulative stream content if this is a final summary chunk
                        if (content === '') {
                            content = Array.isArray(c) 
                                ? c.map((p: any) => typeof p === 'string' ? p : (p.text || JSON.stringify(p))).join('')
                                : c.toString();
                        }
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
