/**
 * SDK-Free Puter API Utility
 * Support for both streaming and non-streaming responses.
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
            'Content-Type': 'text/plain;actually=json',
            'Origin': 'https://puter.com',
            'Referer': 'https://puter.com/',
        },
        body: JSON.stringify({
            interface: options.interface,
            driver: options.driver,
            method: options.method,
            args: options.args,
            auth_token: PUTER_API_KEY,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Puter API Error (${response.status}): ${text}`);
    }

    // We return the raw response so the route can decide how to parse it 
    // (e.g., as streaming chunks or a single JSON block)
    return response;
}
