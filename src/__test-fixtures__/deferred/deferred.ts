export const createDeferred = <Value = void>() => {
  let resolve!: (value: Value) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<Value>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};
