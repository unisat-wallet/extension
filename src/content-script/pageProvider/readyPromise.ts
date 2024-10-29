class ReadyPromise {
    private readonly _allCheck: boolean[] = [];
    private _tasks: {
        resolve: (value: unknown) => void;
        reject: (reason: unknown) => void;
        fn: () => Promise<unknown>;
    }[] = [];

    constructor(count: number) {
        this._allCheck = [...Array(count)];
    }

    check = (index: number) => {
        this._allCheck[index - 1] = true;
        void this._proceed();
    };

    uncheck = (index: number) => {
        this._allCheck[index - 1] = false;
    };

    call = (fn: () => Promise<unknown>) => {
        return new Promise((resolve, reject) => {
            this._tasks.push({
                fn,
                resolve,
                reject
            });

            void this._proceed();
        });
    };

    private _proceed = async () => {
        if (this._allCheck.some((_) => !_)) {
            return;
        }

        while (this._tasks.length) {
            const task = this._tasks.shift();

            if (!task) {
                continue;
            }
    
            const { resolve, reject, fn } = task;

            let errored = false;
            const response = await fn().catch((error) => {
                reject(error);
                errored = true;
            });

            if (errored) {
                continue;
            }

            resolve(response);
        }
    };
}

export default ReadyPromise;
