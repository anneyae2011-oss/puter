/**
 * SDK-Free Puter API Utility
 * This utility uses direct fetch calls to Puter's internal drivers/call endpoint,
 * which is much more reliable in serverless environments than the official SDK.
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
            // Puter's internal API often requires these to bypass "Forbidden" checks
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

    const data = await response.json();
    
    if (data.success === false) {
        throw new Error(data.error?.message || 'Puter API operation failed');
    }

    return data.result;
}
