import { NextRequest, NextResponse } from 'next/server';
import { puterFetch } from '@/lib/puter';

/**
 * Maps an OpenAI model ID to the corresponding Puter driver.
 * Based on gpt4free implementation for maximum compatibility.
 */
function getDriverForModel(model: string): string {
    const m = model.toLowerCase();
    
    if (m.includes('openrouter:')) return 'openrouter';
    if (m.includes('claude')) return 'claude';
    if (m.includes('deepseek')) return 'deepseek';
    if (m.includes('gemini')) return 'gemini';
    if (m.includes('grok')) return 'xai';
    if (m.startsWith('gpt-') || m.startsWith('o1') || m.startsWith('o3') || m.startsWith('o4')) {
        return 'openai-completion';
    }
    if (m.includes('mistral') || m.includes('pixtral') || m.includes('codestral') || m.includes('ministral')) {
        return 'mistral';
    }
    
    // Default to ai-chat or openai-completion
    return 'ai-chat';
}

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

        // Determine the correct Puter driver for this model
        const driver = getDriverForModel(model);
        console.log(`Calling Puter AI: model=${model}, driver=${driver}, stream=${!!stream}`);
        
        try {
            const response = await puterFetch({
                interface: 'puter-chat-completion',
                driver: driver,
                method: 'complete',
                args: {
                    messages,
                    model,
                    stream: stream === true,
                },
            });

            // Read the entire response as text
            const rawText = await response.text();
            
            // Split by lines and parse each valid JSON block (NDJSON)
            const lines = rawText.split('\n').filter(l => l.trim() !== '');
            let content = '';
            let usage = { prompt_tokens: -1, completion_tokens: -1, total_tokens: -1 };

            for (const line of lines) {
                try {
                    const chunk = JSON.parse(line);
                    
                    // Case 1: Standard drivers/call result envelope (non-streaming)
                    if (chunk.success === true && chunk.result) {
                        const resultData = chunk.result;
                        const msgObj = resultData.message;
                        if (msgObj && msgObj.content) {
                            const c = msgObj.content;
                            content = Array.isArray(c) 
                                ? c.map((p: any) => typeof p === 'string' ? p : (p.text || JSON.stringify(p))).join('')
                                : (typeof c === 'string' ? c : JSON.stringify(c));
                        }
                        if (resultData.usage) usage = resultData.usage;
                    } 
                    // Case 2: Streaming chunk {"type":"text","text":"..."}
                    else if (chunk.type === 'text') {
                        content += chunk.text || '';
                    }
                    // Case 3: Streaming usage chunk {"type":"usage","usage":{...}}
                    else if (chunk.type === 'usage' && chunk.usage) {
                        usage = chunk.usage;
                    }
                    // Case 4: Raw result object
                    else if (chunk.message && chunk.message.content) {
                        const c = chunk.message.content;
                        if (content === '') {
                            content = Array.isArray(c) 
                                ? c.map((p: any) => typeof p === 'string' ? p : (p.text || JSON.stringify(p))).join('')
                                : (typeof c === 'string' ? c : JSON.stringify(c));
                        }
                        if (chunk.usage) usage = chunk.usage;
                    }
                } catch (e) {
                    // Ignore empty or malformed lines
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
