import { MonoTypeOperatorFunction, Observable, filter, map } from "rxjs";

const NEVER_EMITTED = Symbol("NEVER_EMITTED");

/**
 * Delays emission of the last value of the source observable until the trigger observable emits
 * @param triggerSource The trigger to emit the last value of the source observable
 * @returns
 */
export function delayUntil<T>(triggerSource: Observable<unknown>): MonoTypeOperatorFunction<T> {
  return function <T>(source: Observable<T>) {
    let buffer: symbol | T = NEVER_EMITTED;
    const sourceSubscription = source.subscribe((v) => {
      buffer = v;
    });
    return new Observable<T>((subscriber) =>
      triggerSource
        .pipe(
          map(() => {
            return buffer;
          }),
          filter((v) => v !== NEVER_EMITTED),
          map((v) => v as T)
        )
        .subscribe({
          next(value) {
            subscriber.next(value);
          },
          error() {
            buffer = null;
            sourceSubscription.unsubscribe();
            subscriber.error();
          },
          complete() {
            buffer = null;
            sourceSubscription.unsubscribe();
            subscriber.complete();
          },
        })
    );
  };
}
