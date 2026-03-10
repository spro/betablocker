import { useEffect, useRef, useState } from "react";
import {
    isWithinSchedule,
    type Schedule,
    type TimeRange,
} from "../lib/schedule";

const DEFAULT_SCHEDULE: Schedule = [{ start: "10:00", end: "18:00" }];

function fmt12(hhmm: string): string {
    const [h, m] = hhmm.split(":").map(Number);
    const suffix = h >= 12 ? "pm" : "am";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

// Migrate old single-range format to array
function normalizeSchedule(raw: unknown): Schedule {
    if (Array.isArray(raw)) return raw as Schedule;
    if (raw && typeof raw === "object") return [raw as TimeRange];
    return DEFAULT_SCHEDULE;
}

export default function Popup() {
    const [domains, setDomains] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        chrome.storage.local.get(
            { blockedDomains: [], schedule: DEFAULT_SCHEDULE },
            (data) => {
                setDomains(data.blockedDomains as string[]);
                setSchedule(normalizeSchedule(data.schedule));
            },
        );
    }, []);

    function saveDomains(updated: string[]) {
        chrome.storage.local.set({ blockedDomains: updated });
        setDomains(updated);
    }

    function remove(domain: string) {
        saveDomains(domains.filter((d) => d !== domain));
    }

    function add() {
        const raw = input
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/\/.*$/, "");
        if (!raw) return;
        if (domains.includes(raw)) {
            setError("Already blocked.");
            return;
        }
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(raw)) {
            setError("Enter a valid domain (e.g. reddit.com).");
            return;
        }
        setError("");
        setInput("");
        saveDomains([...domains, raw]);
        inputRef.current?.focus();
    }

    function saveSchedule(next: Schedule) {
        setSchedule(next);
        chrome.storage.local.set({ schedule: next });
    }

    function updateRange(index: number, field: "start" | "end", value: string) {
        const next = schedule.map((r, i) =>
            i === index ? { ...r, [field]: value } : r,
        );
        saveSchedule(next);
    }

    function addRange() {
        saveSchedule([...schedule, { start: "09:00", end: "17:00" }]);
    }

    function removeRange(index: number) {
        saveSchedule(schedule.filter((_, i) => i !== index));
    }

    const active = isWithinSchedule(schedule);

    return (
        <div className="w-72 bg-white text-gray-900 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="icon-48.png" alt="" className="w-5 h-5 rounded" />
                    <h1 className="text-base font-bold tracking-tight">
                        BetaBlocker
                    </h1>
                </div>
                <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${active ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"}`}
                >
                    {active ? "blocking" : "off"}
                </span>
            </div>

            {/* Schedule */}
            <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Block Hours
                    </p>
                    <button
                        onClick={addRange}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        title="Add time range"
                    >
                        + Add range
                    </button>
                </div>
                <div className="space-y-2">
                    {schedule.map((range, i) => (
                        <div key={i}>
                            <div className="flex items-center gap-2">
                                <input
                                    type="time"
                                    value={range.start}
                                    onChange={(e) =>
                                        updateRange(i, "start", e.target.value)
                                    }
                                    className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-gray-400"
                                />
                                <span className="text-gray-400 text-sm">
                                    to
                                </span>
                                <input
                                    type="time"
                                    value={range.end}
                                    onChange={(e) =>
                                        updateRange(i, "end", e.target.value)
                                    }
                                    className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-gray-400"
                                />
                                {schedule.length > 1 && (
                                    <button
                                        onClick={() => removeRange(i)}
                                        className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                                        title="Remove range"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {fmt12(range.start)} – {fmt12(range.end)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Domains */}
            <div className="px-4 py-3 flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Blocked Domains
                </p>

                {domains.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-2">
                        No domains blocked yet.
                    </p>
                ) : (
                    <ul className="space-y-1 mb-3">
                        {domains.map((domain) => (
                            <li
                                key={domain}
                                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5"
                            >
                                <span className="text-sm text-gray-700">
                                    {domain}
                                </span>
                                <button
                                    onClick={() => remove(domain)}
                                    className="text-gray-300 hover:text-red-500 transition-colors ml-2 text-lg leading-none"
                                    title="Remove"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex gap-2 mt-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && add()}
                        placeholder="reddit.com"
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 placeholder-gray-300"
                    />
                    <button
                        onClick={add}
                        className="text-sm font-medium bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-700 transition-colors"
                    >
                        Add
                    </button>
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        </div>
    );
}
