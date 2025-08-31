// storage/logging/index.ts
export class SystemLogger {
    log(message: string) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [LOG]: ${message}`);
    }

    error(message: string, error?: any) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR]: ${message}`, error || '');
    }
}
