import { ProxyAgent } from 'undici';

let cachedDispatcher: ProxyAgent | undefined;
let cachedProxyUrl: string | undefined;

function getDispatcher(): ProxyAgent | undefined {
    const proxyUrl = process.env.PROXY_URL;
    if (!proxyUrl) return undefined;

    if (cachedDispatcher && cachedProxyUrl === proxyUrl) return cachedDispatcher;

    cachedProxyUrl = proxyUrl;
    cachedDispatcher = new ProxyAgent(proxyUrl);
    return cachedDispatcher;
}

/**
 * Proxy-aware fetch for bot platform outbound API calls.
 *
 * When `PROXY_URL` is set, requests are routed through the proxy.
 * Otherwise falls back to native fetch.
 *
 * This is necessary because Node.js native `fetch` (backed by undici) does NOT
 * respect proxychains or system proxy settings.
 */
export async function proxyFetch(
    url: string | URL | Request,
    init?: RequestInit,
): Promise<Response> {
    const dispatcher = getDispatcher();
    if (!dispatcher) return fetch(url, init);

    return fetch(url, { ...init, dispatcher } as any);
}
