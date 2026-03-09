import type { Attempt } from "../types";

export const SLOT_MS = 60 * 60 * 1000;
export const SLOT_COUNT = 48;

export interface HistogramData {
    buckets: number[];
    slotStart: number;
}

export function buildHourlyBuckets(attempts: Attempt[]): HistogramData {
    const now = Date.now();
    const slotStart = now - SLOT_COUNT * SLOT_MS;

    const buckets = new Array<number>(SLOT_COUNT).fill(0);
    for (const a of attempts) {
        const offset = a.timestamp - slotStart;
        if (offset < 0) continue;
        const slot = Math.min(SLOT_COUNT - 1, Math.floor(offset / SLOT_MS));
        buckets[slot]++;
    }
    return { buckets, slotStart };
}
