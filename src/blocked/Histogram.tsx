import { SLOT_COUNT, SLOT_MS, type HistogramData } from "./histogramData";

const BAR_HEIGHT = 80;
const LABEL_SLOTS = [0, 12, 24, 36, SLOT_COUNT - 1];

// tailwind red-500
const RED_500 = "239,68,68";

function labelForSlot(slotStart: number, i: number) {
    const d = new Date(slotStart + i * SLOT_MS);
    return d
        .toLocaleTimeString([], { hour: "numeric", hour12: true })
        .replace(":00", "")
        .toLowerCase();
}

export default function Histogram({ buckets, slotStart }: HistogramData) {
    const max = Math.max(...buckets, 1);

    return (
        <div>
            <div
                className="flex items-end gap-px"
                style={{ height: BAR_HEIGHT }}
            >
                {buckets.map((count, i) => {
                    const isCurrent = i === SLOT_COUNT - 1;
                    const px =
                        count === 0
                            ? 1
                            : Math.max(
                                  3,
                                  Math.round((count / max) * BAR_HEIGHT),
                              );
                    return (
                        <div
                            key={i}
                            className="relative group flex-1 flex flex-col justify-end"
                        >
                            {count > 0 && (
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] text-white/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    {count}
                                </span>
                            )}
                            <div
                                className="w-full rounded-sm"
                                style={{
                                    height: px,
                                    backgroundColor:
                                        count === 0
                                            ? `rgba(${RED_500},0.08)`
                                            : isCurrent
                                              ? `rgb(${RED_500})`
                                              : `rgba(${RED_500},${0.2 + 0.6 * (count / max)})`,
                                    boxShadow:
                                        isCurrent && count > 0
                                            ? `0 0 8px rgba(${RED_500},0.6)`
                                            : undefined,
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="relative mt-2" style={{ height: 16 }}>
                {LABEL_SLOTS.map((i) => (
                    <span
                        key={i}
                        className="absolute text-xs -translate-x-1/2 text-white/35"
                        style={{ left: `${(i / (SLOT_COUNT - 1)) * 100}%` }}
                    >
                        {labelForSlot(slotStart, i)}
                    </span>
                ))}
            </div>
        </div>
    );
}
