import type { Attempt } from "../types";

const DEFAULT_BLOCKED_DOMAINS = ["x.com", "twitter.com"];
const DEFAULT_SCHEDULE = { start: "10:00", end: "18:00" };

interface Schedule {
    start: string; // "HH:MM"
    end: string; // "HH:MM"
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

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId !== "block-domain" || !info.pageUrl) return;
    let hostname: string;
    try {
        hostname = new URL(info.pageUrl).hostname;
    } catch {
        return;
    }
    chrome.storage.local.get(
        { blockedDomains: DEFAULT_BLOCKED_DOMAINS },
        (data) => {
            const domains = data.blockedDomains as string[];
            if (!domains.includes(hostname)) {
                chrome.storage.local.set({
                    blockedDomains: [...domains, hostname],
                });
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

function isWithinSchedule(schedule: Schedule): boolean {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = schedule.start.split(":").map(Number);
    const [endH, endM] = schedule.end.split(":").map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    // handles overnight ranges (e.g. 22:00–06:00) too
    return start <= end
        ? current >= start && current < end
        : current >= start || current < end;
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId !== 0) return;
    if (!details.url.startsWith("http")) return;

    chrome.storage.local.get(
        { blockedDomains: DEFAULT_BLOCKED_DOMAINS, schedule: DEFAULT_SCHEDULE },
        (data) => {
            const schedule = data.schedule as Schedule;
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
