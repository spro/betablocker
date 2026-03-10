import type { Attempt } from "../types";
import {
    isWithinSchedule,
    type Schedule,
    type TimeRange,
} from "../lib/schedule";

const DEFAULT_BLOCKED_DOMAINS = ["x.com", "twitter.com"];
const DEFAULT_SCHEDULE: Schedule = [{ start: "10:00", end: "18:00" }];

// Migrate old single-range format to array
function normalizeSchedule(raw: unknown): Schedule {
    if (Array.isArray(raw)) return raw as Schedule;
    if (raw && typeof raw === "object") return [raw as TimeRange];
    return DEFAULT_SCHEDULE;
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(
        { blockedDomains: null, schedule: null },
        (data) => {
            const updates: Record<string, unknown> = {};
            if (data.blockedDomains === null)
                updates.blockedDomains = DEFAULT_BLOCKED_DOMAINS;
            if (data.schedule === null) updates.schedule = DEFAULT_SCHEDULE;
            if (Object.keys(updates).length) chrome.storage.local.set(updates);
        },
    );

    chrome.contextMenus.create({
        id: "block-domain",
        title: "Block this site",
        contexts: ["page"],
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== "block-domain" || !info.pageUrl) return;
    let hostname: string;
    try {
        hostname = new URL(info.pageUrl).hostname;
    } catch {
        return;
    }
    chrome.storage.local.get(
        { blockedDomains: DEFAULT_BLOCKED_DOMAINS, schedule: DEFAULT_SCHEDULE },
        (data) => {
            const domains = data.blockedDomains as string[];
            const schedule = normalizeSchedule(data.schedule);
            if (!domains.includes(hostname)) {
                chrome.storage.local.set({
                    blockedDomains: [...domains, hostname],
                });
            }
            if (tab?.id != null && isWithinSchedule(schedule)) {
                const blockedUrl =
                    chrome.runtime.getURL("blocked.html") +
                    "?url=" +
                    encodeURIComponent(info.pageUrl!);
                chrome.tabs.update(tab.id, { url: blockedUrl });
            }
        },
    );
});

function matchedDomain(url: string, blockedDomains: string[]): string | null {
    try {
        const hostname = new URL(url).hostname;
        for (const domain of blockedDomains) {
            if (hostname === domain || hostname.endsWith("." + domain)) {
                return domain;
            }
        }
    } catch {
        // ignore malformed URLs
    }
    return null;
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId !== 0) return;
    if (!details.url.startsWith("http")) return;

    chrome.storage.local.get(
        { blockedDomains: DEFAULT_BLOCKED_DOMAINS, schedule: DEFAULT_SCHEDULE },
        (data) => {
            const schedule = normalizeSchedule(data.schedule);
            if (!isWithinSchedule(schedule)) return;

            const blockedDomains = data.blockedDomains as string[];
            const domain = matchedDomain(details.url, blockedDomains);
            if (!domain) return;

            const attempt: Attempt = {
                timestamp: Date.now(),
                domain,
                fullUrl: details.url,
            };

            chrome.storage.local.get({ attempts: [] as Attempt[] }, (d) => {
                const attempts: Attempt[] = [
                    ...(d.attempts as Attempt[]),
                    attempt,
                ];
                chrome.storage.local.set({ attempts });
            });

            const blockedUrl =
                chrome.runtime.getURL("blocked.html") +
                "?url=" +
                encodeURIComponent(details.url);

            chrome.tabs.update(details.tabId, { url: blockedUrl });
        },
    );
});
