import { useEffect, useState } from "react";
import { HEADINGS, pickTagline, TAGLINES } from "./messages";
import {
    buildHourlyBuckets,
    SLOT_COUNT,
    SLOT_MS,
    type HistogramData,
} from "./histogramData";
import Histogram from "./Histogram";
import type { Attempt } from "../types";
import { formatTime, hostnameFromUrl, timeAgo, toShortUrl } from "./utils";

const heading = HEADINGS[Math.floor(Math.random() * HEADINGS.length)];
const fallbackTagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];

export default function Blocked() {
    const params = new URLSearchParams(window.location.search);
    const blockedUrl = params.get("url") ?? "";
    const domain = hostnameFromUrl(blockedUrl);

    const [tagline, setTagline] = useState(fallbackTagline);
    const [domainCount, setDomainCount] = useState<number>(0);
    const [recent, setRecent] = useState<Attempt[]>([]);
    const [histogram, setHistogram] = useState<HistogramData>(() => ({
        buckets: new Array(SLOT_COUNT).fill(0),
        slotStart: Date.now() - SLOT_COUNT * SLOT_MS,
    }));

    useEffect(() => {
        chrome.storage.local.get({ attempts: [] as Attempt[] }, (data) => {
            const all = data.attempts as Attempt[];
            const forDomain = all.filter(
                (a) =>
                    a.domain === domain ||
                    a.domain === domain.replace(/^www\./, ""),
            );
            setTagline(pickTagline(forDomain));
            setDomainCount(forDomain.length);
            setRecent(forDomain.slice(-10).reverse());
            setHistogram(buildHourlyBuckets(forDomain));
        });
    }, [domain]);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-12 text-white"
            style={{
                background:
                    "radial-gradient(ellipse at 50% 30%, #1c0a0a 0%, #0a0a0a 70%)",
            }}
        >
            <div className="text-center mb-16">
                <h1 className="font-black tracking-tight leading-none mb-5 text-white/95 text-[clamp(4rem,10vw,6rem)]">
                    {heading}
                </h1>
                <p className="text-white/50 text-[1.3rem]">{tagline}</p>
            </div>

            <div className="text-center mb-16">
                <div className="font-black leading-none tracking-tight tabular-nums text-red-500 text-[clamp(4rem,15vw,6rem)]">
                    {domainCount}
                </div>
                <p className="mt-3 uppercase tracking-widest text-xs text-white/40">
                    attempt{domainCount !== 1 ? "s" : ""} to visit {domain}
                </p>
            </div>

            <div className="w-full mb-12 max-w-[640px]">
                <p className="uppercase tracking-widest text-xs mb-4 text-white/35">
                    Last 48 hours
                </p>
                <Histogram
                    buckets={histogram.buckets}
                    slotStart={histogram.slotStart}
                />
            </div>

            {recent.length > 0 && (
                <div className="w-full max-w-[640px] border-t border-white/[0.06] pt-6">
                    <p className="uppercase tracking-widest text-xs mb-4 text-white/35">
                        Recent
                    </p>
                    <ul className="space-y-2 font-mono">
                        {recent.map((a, i) => (
                            <li key={i} className="flex gap-5 text-sm">
                                <span className="text-white/35">
                                    {formatTime(a.timestamp)}
                                </span>
                                <span className="text-white/60 truncate flex-1">
                                    {toShortUrl(a.fullUrl)}
                                </span>
                                <span className="text-white/35 shrink-0">
                                    {timeAgo(a.timestamp)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
