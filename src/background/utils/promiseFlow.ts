import compose from 'koa-compose';

export default class PromiseFlow<TContext> {
    requestedApproval = false;
    private _tasks: ((ctx: TContext, next: () => Promise<void>) => void)[] = [];

    use(fn: (ctx: TContext, next: () => Promise<void>) => void): this {
        if (typeof fn !== 'function') {
            throw new Error('promise need function to handle');
        }
        this._tasks.push(fn);

        return this;
    }

    callback() {
        return compose(this._tasks);
    }
}
