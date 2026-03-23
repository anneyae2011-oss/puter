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
    
    return 'ai-chat';
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { model, messages, stream } = body;

        if (!model || !messages) {
            return NextResponse.json({ error: 'Model and messages are required' }, { status: 400 });
        }

        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (token !== process.env.WANDERERTRADE_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized. Invalid WandererTrade API Key.' }, { status: 401 });
        }

        const driver = getDriverForModel(model);
        console.log(`Calling Puter AI: model=${model}, driver=${driver}, stream=${!!stream}`);
        
        try {
            const puterResponse = await puterFetch({
                interface: 'puter-chat-completion',
                driver: driver,
                method: 'complete',
                args: {
                    messages,
                    model,
                    stream: stream === true,
                },
            });

            const chatId = `chatcmpl-${Math.random().toString(36).substring(7)}`;
            const created = Math.floor(Date.now() / 1000);

            // REAL-TIME STREAMING (SSE)
            if (stream === true) {
                const encoder = new TextEncoder();
                const decoder = new TextDecoder();
                const reader = puterResponse.body?.getReader();

                const streamResponse = new ReadableStream({
                    async start(controller) {
                        if (!reader) {
                            controller.close();
                            return;
                        }

                        let buffer = '';
                        try {
                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;

                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split('\n');
                                buffer = lines.pop() || '';

                                for (const line of lines) {
                                    if (!line.trim()) continue;
                                    try {
                                        const chunk = JSON.parse(line);
                                        let deltaContent = '';
                                        let finishReason: string | null = null;

                                        if (chunk.type === 'text') {
                                            deltaContent = chunk.text || '';
                                        } else if (chunk.type === 'usage' || (chunk.finish_reason && chunk.finish_reason !== null)) {
                                            finishReason = chunk.finish_reason || 'stop';
                                        }

                                        if (deltaContent || finishReason) {
                                            const openAIChunk = {
                                                id: chatId,
                                                object: 'chat.completion.chunk',
                                                created: created,
                                                model: model,
                                                choices: [
                                                    {
                                                        index: 0,
                                                        delta: deltaContent ? { content: deltaContent } : {},
                                                        finish_reason: finishReason,
                                                    },
                                                ],
                                            };
                                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`));
                                        }
                                    } catch (e) {
                                        // Ignore malformed chunks
                                    }
                                }
                            }
                            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        } catch (err) {
                            console.error('Streaming error:', err);
                        } finally {
                            controller.close();
                        }
                    },
                });

                return new Response(streamResponse, {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                    },
                });
            }

            // NON-STREAMING (Standard JSON)
            const rawText = await puterResponse.text();
            const lines = rawText.split('\n').filter(l => l.trim() !== '');
            let content = '';
            let usage = { prompt_tokens: -1, completion_tokens: -1, total_tokens: -1 };

            for (const line of lines) {
                try {
                    const chunk = JSON.parse(line);
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
                    } else if (chunk.type === 'text') {
                        content += chunk.text || '';
                    } else if (chunk.type === 'usage' && chunk.usage) {
                        usage = chunk.usage;
                    } else if (chunk.message && chunk.message.content) {
                        const c = chunk.message.content;
                        if (content === '') {
                            content = Array.isArray(c) 
                                ? c.map((p: any) => typeof p === 'string' ? p : (p.text || JSON.stringify(p))).join('')
                                : (typeof c === 'string' ? c : JSON.stringify(c));
                        }
                        if (chunk.usage) usage = chunk.usage;
                    }
                } catch (e) {}
            }

            return NextResponse.json({
                id: chatId,
                object: 'chat.completion',
                created: created,
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
