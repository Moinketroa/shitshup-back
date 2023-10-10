import { Duration } from 'luxon';

export function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return obj === undefined || obj === null;
}

export function isDefined<T>(obj: T | null | undefined): obj is T {
    return obj !== null && obj !== undefined;
}

export function roundTwoDecimal(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatDurationFromSeconds(seconds: number, format: string): string {
    return Duration.fromObject({
        seconds,
    }).toFormat(format);
}

export function convertRange(value: number, firstRange: [number, number], secondRange: [number, number]) {
    return (
        ((value - firstRange[0]) * (secondRange[1] - secondRange[0])) / (firstRange[1] - firstRange[0]) + secondRange[0]
    );
}