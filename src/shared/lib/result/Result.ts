
export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

export class Ok<T, E = Error> {
    readonly ok: true = true;
    readonly err: false = false;

    constructor(readonly value: T) {}

    isOk(): this is Ok<T, E> {
        return true;
    }
    isErr(): this is Err<T, E> {
        return false;
    }
    map<U>(fn: (value: T) => U): Result<U, E> {
        return ok(fn(this.value));
    }

    mapErr<F>(fn: (error: E) => F): Result<T, F> {
        return ok(this.value);
    }

    andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
        return fn(this.value);
    }

    unwrapOr(defaultValue: T): T {
        return this.value;
    }

    unwrapOrElse(fn: (error: E) => T): T {
        return this.value;
    }

    unwrap(): T {
        return this.value;
    }


    match<U>(patterns: { ok: (value: T) => U; err: (error: E) => U }): U {
        return patterns.ok(this.value);
    }

    async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Result<U, E>> {
        try {
            const result = await fn(this.value);
            return ok(result);
        } catch (error) {
            return err(error as E);
        }
    }

    async andThenAsync<U>(
        fn: (value: T) => Promise<Result<U, E>>
    ): Promise<Result<U, E>> {
        return fn(this.value);
    }
}


export class Err<T, E = Error> {
    readonly ok: false = false;
    readonly err: true = true;

    constructor(readonly error: E) {}

    isOk(): this is Ok<T, E> {
        return false;
    }

    isErr(): this is Err<T, E> {
        return true;
    }

    map<U>(fn: (value: T) => U): Result<U, E> {
        return err(this.error);
    }

    mapErr<F>(fn: (error: E) => F): Result<T, F> {
        return err(fn(this.error));
    }

    andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
        return err(this.error);
    }

    unwrapOr(defaultValue: T): T {
        return defaultValue;
    }

    unwrapOrElse(fn: (error: E) => T): T {
        return fn(this.error);
    }

    unwrap(): never {
        throw this.error;
    }

    match<U>(patterns: { ok: (value: T) => U; err: (error: E) => U }): U {
        return patterns.err(this.error);
    }

    async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Result<U, E>> {
        return err(this.error);
    }

    async andThenAsync<U>(
        fn: (value: T) => Promise<Result<U, E>>
    ): Promise<Result<U, E>> {
        return err(this.error);
    }
}

export const ok = <T, E = Error>(value: T): Ok<T, E> => new Ok(value);

export const err = <T, E = Error>(error: E): Err<T, E> => new Err(error);

export async function fromPromise<T, E = Error>(
    promise: Promise<T>,
    errorMapper?: (error: unknown) => E
): Promise<Result<T, E>> {
    try {
        const value = await promise;
        return ok(value);
    } catch (error) {
        const mappedError = errorMapper
            ? errorMapper(error)
            : (error as E);
        return err(mappedError);
    }
}


export function fromThrowable<T, E = Error>(
    fn: () => T,
    errorMapper?: (error: unknown) => E
): Result<T, E> {
    try {
        const value = fn();
        return ok(value);
    } catch (error) {
        const mappedError = errorMapper
            ? errorMapper(error)
            : (error as E);
        return err(mappedError);
    }
}

export function combine<T extends readonly Result<any, any>[]>(
    results: T
): Result<
    { [K in keyof T]: T[K] extends Result<infer U, any> ? U : never },
    T[number] extends Result<any, infer E> ? E : never
> {
    const values: any[] = [];

    for (const result of results) {
        if (result.isErr()) {
            return err(result.error);
        }
        values.push(result.value);
    }

    return ok(values as any);
}
