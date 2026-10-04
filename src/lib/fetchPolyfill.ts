// Safe native fetch wrapper to prevent cross-fetch or node-fetch polyfill errors
const safeFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : globalThis.fetch;

export default safeFetch;
export const fetch = safeFetch;
export const Headers = typeof window !== 'undefined' ? window.Headers : globalThis.Headers;
export const Request = typeof window !== 'undefined' ? window.Request : globalThis.Request;
export const Response = typeof window !== 'undefined' ? window.Response : globalThis.Response;
