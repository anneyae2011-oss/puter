/**
 * SDK-Free Puter API Utility (gpt4free-enhanced)
 * This utility uses headers and patterns from the successful gpt4free implementation.
 */

export const PUTER_API_KEY = process.env.PUTER_API_KEY;

export async function puterFetch(options: {
    interface: string;
    driver: string;
    method: string;
    args: any;
}) {
    if (!PUTER_API_KEY) {
        throw new Error('PUTER_API_KEY is not set');
    }

    const response = await fetch('https://api.puter.com/drivers/call', {
        method: 'POST',
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'authorization': `Bearer ${PUTER_API_KEY}`,
            // Crucial headers from gpt4free to mimic official docs playground
            'origin': 'http://docs.puter.com',
            'referer': 'http://docs.puter.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
            interface: options.interface,
            driver: options.driver,
            test_mode: false,
            method: options.method,
            args: options.args,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Puter API Error (${response.status}): ${text}`);
    }

    return response;
}
