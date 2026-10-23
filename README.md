# EasyFetch Backend

A small Express server that downloads videos from YouTube, X (Twitter), and Instagram using [yt-dlp](https://github.com/yt-dlp/yt-dlp).

## Requirements

- Node.js 18+
- `yt-dlp` executable (included in this repository as `./yt-dlp`)

## Setup

```bash
npm install
```

Create a `.env` file (optional) to override defaults:

```env
YTDL_EXECUTABLE=./yt-dlp
HOST=0.0.0.0
PORT=8000
```

## Usage

Start the server:

```bash
npm start
```

Download a video:

```bash
curl -X POST http://localhost:8000/yt \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

Response:

```json
{ "message": "success", "fileName": "dQw4w9WgXcQ-<uuid>.mp4" }
```

### Endpoints

| Method | Path     | Description                |
| ------ | -------- | -------------------------- |
| POST   | `/yt`    | Download a YouTube video   |
| POST   | `/x`     | Download an X/Twitter post |
| POST   | `/insta` | Download an Instagram post |

All endpoints accept a JSON body of `{ "url": "<video-url>" }`.

Downloaded files are written to the `videos/` directory.

## Notes

- At most 3 downloads run concurrently; additional requests wait in a queue.
- Downloads are limited to 1080p and merged into MP4.
- The `videos/` directory and `.env` file are git-ignored.
