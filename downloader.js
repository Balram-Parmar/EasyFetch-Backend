import path from "node:path";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";

const runExecutable = promisify(execFile);

export const DOWNLOAD_DIR = path.resolve("./videos");
const YTDL_EXECUTABLE = process.env.YTDL_EXECUTABLE || "./yt-dlp";

const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_CONCURRENT_DOWNLOADS = 3;
const QUEUE_WAIT_MS = 60 * 1000;

const COMMON_ARGS = [
    "--ignore-config",
    "--no-playlist",
    "--no-simulate",
    "--force-ipv4",
    "--concurrent-fragments", "4",
    "--retries", "10",
    "--fragment-retries", "10",
    "--http-chunk-size", "10M",
    "--buffer-size", "16K",
    "--throttled-rate", "100K",
    "--merge-output-format", "mp4",
    "--trim-filenames", "150",
    "--no-mtime",
    "--newline",
];

export function parseUrl(input) {
    if (typeof input !== "string" || !input.trim()) {
        return null;
    }

    try {
        const text = input.trim();
        const url = new URL(
            /^https?:\/\//i.test(text) ? text : `https://${text.replace(/^\/+/, "")}`
        );

        if (!["https:", "http:"].includes(url.protocol)) {
            return null;
        }

        return url;
    } catch {
        return null;
    }
}

export function hasSafeAuthority(url) {
    return !url.username && !url.password && !url.port;
}

let activeDownloads = 0;
const pendingResolvers = [];

async function acquireSlot() {
    while (activeDownloads >= MAX_CONCURRENT_DOWNLOADS) {
        await new Promise((resolve, reject) => {
            const onError = () => {
                const index = pendingResolvers.indexOf(release);
                if (index !== -1) {
                    pendingResolvers.splice(index, 1);
                }

                const busyError = new Error("Too many downloads are in progress.");
                busyError.status = 503;
                reject(busyError);
            };

            const timer = setTimeout(onError, QUEUE_WAIT_MS);
            timer.unref?.();

            const release = () => {
                clearTimeout(timer);
                resolve();
            };

            pendingResolvers.push(release);
        });
    }

    activeDownloads += 1;
}

function releaseSlot() {
    activeDownloads = Math.max(0, activeDownloads - 1);

    const next = pendingResolvers.shift();
    if (next) {
        next();
    }
}

async function downloadVideo(videoUrl, extraArgs = []) {
    await fs.mkdir(DOWNLOAD_DIR, { recursive: true });

    const outputTemplate = `%(id)s-${randomUUID()}.%(ext)s`;

    const { stdout } = await runExecutable(
        YTDL_EXECUTABLE,
        [
            ...COMMON_ARGS,
            ...extraArgs,
            "--paths",
            DOWNLOAD_DIR,
            "--output",
            outputTemplate,
            "--format",
            "bv*[height<=1080]+ba/b[height<=1080]/b",
            "--print",
            "after_move:filepath",
            "--",
            videoUrl
        ],
        {
            timeout: DOWNLOAD_TIMEOUT_MS,
            maxBuffer: 1024 * 1024 * 16
        }
    );

    const downloadedPath = stdout.trim().split(/\r?\n/).pop();

    if (!downloadedPath) {
        throw new Error("Downloader did not return a file path.");
    }

    await fs.access(downloadedPath);

    return path.basename(downloadedPath);
}

export async function downloadWithSlot(videoUrl, extraArgs = []) {
    await acquireSlot();

    try {
        return await downloadVideo(videoUrl, extraArgs);
    } finally {
        releaseSlot();
    }
}
