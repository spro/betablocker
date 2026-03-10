export interface TimeRange {
    start: string; // "HH:MM"
    end: string; // "HH:MM"
}

export type Schedule = TimeRange[];

function withinRange(range: TimeRange): boolean {
    if (!range?.start || !range?.end) return false;

    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = range.start.split(":").map(Number);
    const [endH, endM] = range.end.split(":").map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    // handles overnight ranges (e.g. 22:00–06:00) too
    return start <= end
        ? current >= start && current < end
        : current >= start || current < end;
}

export function isWithinSchedule(schedule: Schedule): boolean {
    return schedule.some(withinRange);
}
