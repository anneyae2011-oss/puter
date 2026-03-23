import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { join } from 'node:path';

let puterInstance: any = null;

export default function getPuter() {
    if (puterInstance) return puterInstance;

    const token = process.env.PUTER_API_KEY;
    if (!token) {
        console.warn('PUTER_API_KEY is not set');
    }

    try {
        // Prepare the sandbox context
        const g: any = globalThis;
        const goodContext: any = {
            PUTER_API_ORIGIN: g.PUTER_API_ORIGIN,
            PUTER_ORIGIN: g.PUTER_ORIGIN,
            process: process,
            console: console,
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            setInterval: setInterval,
            clearInterval: clearInterval,
        };

        // Copy global properties to the sandbox
        Object.getOwnPropertyNames(g).forEach(name => {
            try {
                if (!(name in goodContext)) {
                    goodContext[name] = g[name];
                }
            } catch {
                // silent fail
            }
        });
        
        goodContext.globalThis = goodContext;

        // Load the Puter SDK bundle from node_modules
        // We use process.cwd() to be reliable on Vercel
        const sdkPath = join(process.cwd(), 'node_modules', '@heyputer', 'puter.js', 'dist', 'puter.cjs');
        const code = readFileSync(sdkPath, 'utf8');

        // Execute in a new VM context
        const context = vm.createContext(goodContext);
        vm.runInNewContext(code, context);

        if (token) {
            goodContext.puter.setAuthToken(token);
        }

        puterInstance = goodContext.puter;
        return puterInstance;
    } catch (error) {
        console.error('Failed to initialize Puter SDK:', error);
        // Fallback or re-throw
        throw error;
    }
}
