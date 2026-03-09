import type { Attempt } from "../types";

export function pickTagline(forDomain: Attempt[]): string {
    const now = Date.now();
    const sorted = [...forDomain].sort((a, b) => a.timestamp - b.timestamp);

    // treat attempts in last 30s as potentially the current visit
    const prev = sorted.filter((a) => now - a.timestamp > 30_000);
    const lastHour = sorted.filter((a) => now - a.timestamp < 60 * 60_000);
    const last10min = sorted.filter((a) => now - a.timestamp < 10 * 60_000);

    if (last10min.length >= 5)
        return `${last10min.length} times in 10 minutes. This is a cry for help.`;
    if (last10min.length >= 3)
        return `${last10min.length} attempts in 10 minutes. You have a problem.`;
    if (lastHour.length >= 5)
        return `${lastHour.length} times in one hour. Genuinely embarrassing.`;
    if (lastHour.length >= 3)
        return `${lastHour.length} times in the last hour. You are not okay.`;
    if (lastHour.length === 2)
        return "Twice in one hour. You were almost a functional person.";

    if (prev.length > 0) {
        const minsAgo = Math.floor(
            (now - prev[prev.length - 1].timestamp) / 60_000,
        );
        if (minsAgo < 2) return "You were just here. Literally just here.";
        if (minsAgo < 10)
            return `${minsAgo} minutes. That's how long you lasted.`;
        if (minsAgo < 60)
            return `${minsAgo} minutes since your last failure. A new record.`;
    }

    if (sorted.length >= 20)
        return `Attempt #${sorted.length}. At this point just delete the extension and embrace the rot.`;
    if (sorted.length >= 10)
        return `Attempt #${sorted.length}. Statistically, you are losing.`;

    return TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
}

export const HEADINGS = [
    "Nice try.",
    "Really?",
    "Oh, come on.",
    "Absolutely not.",
    "Caught you.",
    "Again?!",
    "Nope.",
    "Bold move.",
    "LOL.",
    "Incredible.",
    "Access denied.",
    "Not today.",
    "Wow.",
    "You again.",
    "Hard pass.",
    "Unbelievable.",
    "Embarrassing.",
    "I don't think so.",
    "Blocked.",
    "Seriously?",
    "Pathetic.",
    "Get a grip.",
    "No.",
    "Stop it.",
    "Go away.",
    "Grow up.",
    "Come on, man.",
    "You're better than this.",
    "What is wrong with you.",
    "Disgraceful.",
];

export const TAGLINES = [
    "Write some code. Touch grass. Do literally anything else.",
    "Your future self is ashamed of you.",
    "At this point it's a diagnosable condition.",
    "Nothing good is waiting for you there. Nothing.",
    "Remarkable dedication to achieving absolutely nothing.",
    "Go drink some water and open your IDE.",
    "You have nothing to learn from that website.",
    "Pull it together.",
    "I'm starting to think you want to fail.",
    "Whatever you were about to doomscroll can wait forever.",
    "Nothing has changed since the last time you checked. Nothing ever does.",
    "The issue you're avoiding is still there, getting worse.",
    "That dopamine hit will last four seconds. Was it worth it?",
    "You know what would feel better? Actually shipping something.",
    "Your competitors are not on this website right now.",
    "This is not a break. This is decay.",
    "Close the tab. You already know what's on there.",
    "Every time you do this, a senior engineer cries.",
    "You installed this extension for a reason. Remember that reason.",
    "The work doesn't do itself while you scroll.",
    "Be so fr right now.",
    "You are the problem.",
    "This is not the move.",
    "Imagine explaining this to someone who respects you.",
    "Log off. Go outside. Touch something real.",
];
