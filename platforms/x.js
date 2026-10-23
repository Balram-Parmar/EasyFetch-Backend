import { downloadWithSlot, parseUrl, hasSafeAuthority } from "../downloader.js";

export function toXUrl(input) {
    const url = parseUrl(input);

    if (!url || !hasSafeAuthority(url)) {
        return null;
    }

    const host = url.hostname.toLowerCase();

    if (
        !["x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"].includes(host)
    ) {
        return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const statusIndex = segments.indexOf("status");

    if (
        statusIndex < 0 ||
        statusIndex + 2 > segments.length ||
        !/^\d+$/.test(segments[statusIndex + 1])
    ) {
        return null;
    }

    return `https://x.com/${segments
        .slice(0, statusIndex + 2)
        .join("/")}/`;
}

export async function download(rawUrl) {
    const videoUrl = toXUrl(rawUrl);

    if (!videoUrl) {
        const error = new Error("Please enter a valid X (Twitter) post URL.");
        error.status = 400;
        throw error;
    }

    return downloadWithSlot(videoUrl);
}
