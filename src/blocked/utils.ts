export function hostnameFromUrl(url: string) {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

export function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function timeAgo(ts: number) {
    const mins = Math.floor((Date.now() - ts) / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function toShortUrl(fullUrl: string) {
    try {
        const u = new URL(fullUrl);
        return u.hostname + u.pathname;
    } catch {
        return fullUrl;
    }
}
