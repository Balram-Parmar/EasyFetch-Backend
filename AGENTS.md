# AGENTS.md

## What this is
Express server (`routes.js`) that downloads videos from YouTube / X / Instagram by shelling out to a vendored `yt-dlp` binary. ES modules, no build step, no test/lint/typecheck tooling.

## Commands
- Run: `npm start` (= `node routes.js`). Must run from the repo root: `DOWNLOAD_DIR` and the default `YTDL_EXECUTABLE` are resolved relative to CWD.
- No test, lint, or typecheck scripts exist. Verify by starting the server and POSTing a real URL:
  `curl -X POST http://localhost:8000/yt -H 'Content-Type: application/json' -d '{"url":"<video-url>"}'`

## Setup / environment gotchas
- `.env` is **not** auto-loaded (no `dotenv`, no `--env-file`). Set vars in the shell, or run `node --env-file=.env routes.js`.
- Defaults from code: `HOST=127.0.0.1`, `PORT=8000`, `YTDL_EXECUTABLE=./yt-dlp`, `YT_COOKIE_FILE=./cookie.txt`. README claims `HOST` defaults to `0.0.0.0`, but the code default is `127.0.0.1`.
- `ffmpeg` must be on PATH; the vendored `yt-dlp` binary does not bundle it and needs it to merge separate video+audio streams.
- `yt-dlp` is a committed ~40 MB Linux x86-64 ELF binary (v2026.10.21), not a Python dependency. Replace the file to upgrade.
- YouTube downloads pass `--cookies cookie.txt`; `cookie.txt` is tracked in git and holds live session cookies.

## Architecture
- `routes.js` — Express app (CORS `*`, JSON body limit 10 kb); POST `/yt`, `/x`, `/insta` all share `createDownloadRoute`.
- `platforms/{youtube,x,instagram}.js` — each exports `download(rawUrl)` plus a `to<Platform>Url()` normalizer that validates the host and rebuilds a canonical URL. `parseUrl` + `hasSafeAuthority` reject credentials and explicit ports.
- `downloader.js` — `downloadWithSlot()` gates concurrency (max 3 active; 60 s queue wait throws a `503`) then runs yt-dlp via `execFile`. `COMMON_ARGS` caps quality at 1080p and merges to mp4.
- Output files go to `videos/` (gitignored except `.gitkeep`), named `%(id)s-<uuid>.mp4`.
- `YTDLP.md` (repo root) is the full yt-dlp manpage; the repo-local `yt-dlp` skill (`.opencode/skills/yt-dlp/`) wraps it.

## Editing notes
- The route handler catches every error and always returns 500; the `error.status` (400/503) set in platform/downloader code is currently ignored. Update `createDownloadRoute` if you want real status codes.
- When changing the yt-dlp invocation, keep args as an array (never a shell string), keep `--` before the URL, and read the output path from the last line of stdout (`--print after_move:filepath`).
