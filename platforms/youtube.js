import { downloadWithSlot, parseUrl, hasSafeAuthority } from "../downloader.js";

export function toYouTubeUrl(input) {
    const url = parseUrl(input);

    if (!url || !hasSafeAuthority(url)) {
        return null;
    }

    const host = url.hostname.toLowerCase();
    const segments = url.pathname.split("/").filter(Boolean);

    let id;

    if (host === "youtu.be") {
        id = segments[0];
    } else if (
        ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)
    ) {
        if (url.pathname === "/watch") {
            id = url.searchParams.get("v");
        } else if (segments[0] === "shorts") {
            id = segments[1];
        }
    }

    return typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id)
        ? `https://www.youtube.com/watch?v=${id}`
        : null;
}

export async function download(rawUrl) {
    const videoUrl = toYouTubeUrl(rawUrl);

    if (!videoUrl) {
        const error = new Error("Please enter a valid YouTube video URL.");
        error.status = 400;
        throw error;
    }

    return downloadWithSlot(videoUrl);
}
