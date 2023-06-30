export function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return obj === undefined || obj === null;
}

export function isDefined<T>(obj: T | null | undefined): obj is T {
    return obj !== null && obj !== undefined;
}
