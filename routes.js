import express from "express";
import cors from "cors";

import { download as downloadYouTube } from "./platforms/youtube.js";
import { download as downloadX } from "./platforms/x.js";
import { download as downloadInstagram } from "./platforms/instagram.js";
import { DOWNLOAD_DIR } from "./downloader.js";

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "127.0.0.1";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10kb" }));

function createDownloadRoute(downloadFn) {
    return async (req, res) => {
        console.log("download request recived for :" + req.body.url)
        const rawUrl = req.body.url;

        try {
            const fileName = await downloadFn(rawUrl);

            return res.json({
                message: "success",
                fileName
            });
        } catch (error) {
            // execFile puts yt-dlp's output in stderr; error.message only holds
            // the command line, which hides the real reason for the failure.
            const detail = error.stderr?.trim() || error.message;
            console.error("Download failed:", detail);

            const status = Number.isInteger(error.status) ? error.status : 500;

            return res.status(status).json({ "error": "error downloading the video" });
        }
    };
}

app.post("/yt", createDownloadRoute(downloadYouTube));
app.post("/x", createDownloadRoute(downloadX));
app.post("/insta", createDownloadRoute(downloadInstagram));

app.listen(PORT, HOST, () => {
    console.log(`Server: http://${HOST}:${PORT}`);
    console.log(`Downloads: ${DOWNLOAD_DIR}`);
});

export default app;
