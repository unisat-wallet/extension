type Listener = (params?: unknown) => void;

// TODO (typing): It may not worth it to make EventBus generic at this point 
// since there are some usages where we pass 'params' dynamically (i.e. rpcFlow.ts).
// Making this generic may be more meaningful when we have a strict typing in provider controller functions.
class EventBus {
    events: Record<string, Listener[]> = {};

    emit = (type: string, params?: unknown) => {
        const listeners = this.events[type];
        if (listeners) {
            listeners.forEach((fn) => {
                fn(params);
            });
        }
    };

    once = (type: string, fn: Listener) => {
        const listeners = this.events[type];
        const func = (...params: unknown[]) => {
            fn(...params);
            this.events[type] = this.events[type].filter((item) => item !== func);
        };
        if (listeners) {
            this.events[type].push(func);
        } else {
            this.events[type] = [func];
        }
    };

    addEventListener = (type: string, fn: Listener) => {
        const listeners = this.events[type];
        if (listeners) {
            this.events[type].push(fn);
        } else {
            this.events[type] = [fn];
        }
    };

    removeEventListener = (type: string, fn: Listener) => {
        const listeners = this.events[type];
        if (listeners) {
            this.events[type] = this.events[type].filter((item) => item !== fn);
        }
    };

    removeAllEventListeners = (type: string) => {
        this.events[type] = [];
    };
}

export default new EventBus();
