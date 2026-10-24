---
name: yt-dlp
description: Use when downloading audio/video with yt-dlp, writing or debugging yt-dlp CLI commands, choosing formats (-f/-S), output templates (-o/-P), cookies/auth, post-processing (extract audio, remux, embed subtitles/thumbnail), playlists, or editing downloader.js in this repo. Covers the yt-dlp manpage (YTDLP.md) converted to a skill.
---

# yt-dlp

Feature-rich command-line audio/video downloader supporting thousands of sites. This skill is the condensed form of `reference/YTDLP.md` (the full yt-dlp manpage). Read that file for the complete option list and examples.

## In this repo

- Binary is vendored at `./yt-dlp`; override with `YTDL_EXECUTABLE`.
- `downloader.js` shells out via `execFile` with `COMMON_ARGS`, output template `%(id)s-<uuid>.%(ext)s`, and `--format "bv*[height<=1080]+ba/b[height<=1080]/b"`.
- Cookies live in `cookie.txt`; downloaded files go to `videos/`.
- When editing download logic, keep args as an array (no shell), pass `--` before the URL, and read the final path from `--print after_move:filepath`.

## Common invocations

```bash
# Best quality (default) — merge best video + best audio
yt-dlp "URL"

# Cap at 1080p, prefer mp4
yt-dlp -f "bv*[height<=1080]+ba/b[height<=1080]/b" --merge-output-format mp4 "URL"

# List available formats / extract metadata only
yt-dlp -F "URL"
yt-dlp -j "URL"

# Audio-only mp3
yt-dlp -x --audio-format mp3 --audio-quality 0 "URL"
yt-dlp -t mp3 "URL"            # preset alias

# Subtitles + thumbnail
yt-dlp --write-subs --sub-langs "en.*" --embed-subs --embed-thumbnail "URL"

# Whole playlist into a folder
yt-dlp -o "%(playlist_title)s/%(playlist_index)s - %(title)s.%(ext)s" "PLAYLIST_URL"

# Authenticated / private content
yt-dlp --cookies cookie.txt "URL"
yt-dlp --cookies-from-browser firefox "URL"
```

## Key concepts

- **Format selection** `-f`: selector expressions like `bestvideo+bestaudio`, `best[height=720]`, `22/17/18`, `bv*[height<=1080]+ba/b`. Use `-S` to sort instead of hard-picking (`-S res:1080,codec:h264`). See `reference/YTDLP.md` → FORMAT SELECTION.
- **Output template** `-o` / paths `-P`: fields like `%(title)s`, `%(id)s`, `%(ext)s`, `%(upload_date)s`, `%(playlist_index)s`. Per-type templates: `-o "thumbnail:%(title)s.%(ext)s"`. See OUTPUT TEMPLATE.
- **Preset aliases** `-t`: `mp3`, `aac`, `mp4`, `mkv`, `sleep`.
- **Post-processing**: `-x/--extract-audio`, `--remux-video`, `--recode-video`, `--embed-subs`, `--embed-thumbnail`, `--embed-metadata`, `--postprocessor-args`.
- **Config files**: loaded from `yt-dlp.conf` / platform dirs; `--ignore-config` disables them (this repo uses it).
- **Auth**: `--cookies`, `--cookies-from-browser`, `--username/--password`, `--netrc`, `--video-password`.
- **Playlists/selection**: `--no-playlist`/`--yes-playlist`, `-I/--playlist-items`, `--download-archive`, `--dateafter`.
- **Network**: `--proxy`, `--impersonate`, `--limit-rate`, `--concurrent-fragments`.

## Reference

- `reference/YTDLP.md` — full manpage: every option, output-template fields, format filtering/sorting, metadata modification, extractor arguments, plugins, embedding API, and changes from youtube-dl.
