import puter from '@heyputer/puter.js';

if (process.env.PUTER_API_KEY) {
    puter.auth.setApiKey(process.env.PUTER_API_KEY);
}

export default puter;
