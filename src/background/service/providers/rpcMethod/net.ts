export const DEFAULT_TIMEOUT = 120000;

export const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

function _fetch(fetchPromise: Promise<any>, timeout: number) {
  let abortFn: () => void;

  const abortPromise = new Promise((resolve, reject) => {
    abortFn = () => reject(new Error(`request Timeout in ${timeout} ms`));
  });
  const abortablePromise = Promise.race([fetchPromise, abortPromise]);

  setTimeout(() => {
    abortFn();
  }, timeout);

  return abortablePromise;
}

export const performRPC = async (request: any, handler: any, fetcher: any) => {
  try {
    const response = await _fetch(
      fetcher.requestHandler(request, DEFAULT_HEADERS),
      request.options && request.options.timeout ? request.options.timeout : DEFAULT_TIMEOUT
    );
    return fetcher.responseHandler(response, request, handler);
  } catch (err) {
    throw err;
  }
};

export function composeMiddleware(...fns: any[]): any {
  if (fns.length === 0) {
    return (arg: any) => arg;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return fns.reduce((a, b) => (arg: any) => a(b(arg)));
}
