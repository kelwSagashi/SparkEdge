import { IDeferredPromise } from "./interfaces/deferred-promise";

export function createDeferredPromise<T = void>(): IDeferredPromise<T> {
	const deferred: Partial<IDeferredPromise<T>> = {};
	deferred.promise = new Promise<T>((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});
	return deferred as IDeferredPromise<T>;
}
