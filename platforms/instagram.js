import { downloadWithSlot, parseUrl, hasSafeAuthority } from "../downloader.js";

export function toInstagramUrl(input) {
    const url = parseUrl(input);

    if (!url || !hasSafeAuthority(url)) {
        return null;
    }

    const host = url.hostname.toLowerCase();

    if (!["instagram.com", "www.instagram.com", "instagr.am", "www.instagr.am"].includes(host)) {
        return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);

    if (!["p", "reel", "reels", "tv", "share"].includes(segments[0])) {
        return null;
    }

    return `https://www.instagram.com/${segments.join("/")}/`;
}

export async function download(rawUrl) {
    const videoUrl = toInstagramUrl(rawUrl);

    if (!videoUrl) {
        const error = new Error("Please enter a valid Instagram reel/post URL.");
        error.status = 400;
        throw error;
    }

    return downloadWithSlot(videoUrl);
}
