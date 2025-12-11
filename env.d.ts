// Cloudflare Pages environment bindings
interface CloudflareEnv {
  EXA_API_KEY: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CloudflareEnv {}
  }
}

export {};
