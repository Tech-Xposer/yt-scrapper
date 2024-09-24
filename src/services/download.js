import ytdl from "@distube/ytdl-core";
import fs from "fs";
import path from "path";
import Ffmpeg from "fluent-ffmpeg";
import dbConnect from "@/lib/connect";
import Movies from "@/models/movies.model";

const downloadVideo = async (videoUrl, downloadPath, videoId) => {
  console.log("starting download");

  // connecting to database
  await dbConnect();

  // Scrape video information
  const info = await scrapeVideoInfo(videoUrl);

  // find channel id
  const channelId = info.videoDetails.author.channelId;
  //create channel if not exist

  let channel = await Movies.findOne({ channelId: channelId });

  if (!channel) {
    channel = await Movies.create({
      channelId: channelId,
    });
  }

  const fileName = sanitizeFileName(info.videoDetails.title);

  const safeFileName = fileName.replace(/[^a-zA-Z0-9]/g, " ");

  // check if 1080p format available
  const videoFormats = ytdl.filterFormats(info.formats, "video");

  let format = videoFormats.find((f) => f.qualityLabel === "1080p");

  // If 1080p is not available, fallback to 720p
  if (!format) {
    format = videoFormats.find((f) => f.qualityLabel === "720p");
  }
  if (!format) {
    format = videoFormats.find((f) => f.qualityLabel === "480p");
  }

  if (!format) {
    format = videoFormats.find((f) => f.qualityLabel === "360p");
  }

  // Output paths for video, audio, and the final merged file

  const videoOutputPath = path.join(downloadPath, `temp_${safeFileName}.mp4`);

  const audioOutputPath = path.join(
    downloadPath,
    `temp_${safeFileName}_audio.mp4`,
  );

  const finalOutputPath = path.join(downloadPath, `${safeFileName}.mp4`);

  try {
    const videoStream = ytdl
      .downloadFromInfo(info, {
        format: format,
      })
      .pipe(fs.createWriteStream(videoOutputPath));

    //progress
    videoStream.on("progress", (chunkLength, downloaded, total) => {
      const percent = (downloaded / total) * 100;
      console.log(`Progress: ${percent.toFixed(2)}%`);
    });

    const audioStream = ytdl(videoUrl, { quality: "lowestaudio" }).pipe(
      fs.createWriteStream(audioOutputPath),
    );
    audioStream.on("progress", (chunkLength, downloaded, total) => {
      const percent = (downloaded / total) * 100;
      console.log(`Audio Progress: ${percent.toFixed(2)}%`);
    });

    // Wait for both streams to finish downloading
    await Promise.all([
      new Promise((resolve, reject) => {
        videoStream.on("finish", () => {
          console.log("video downloaded");
          resolve();
        });
        videoStream.on("error", () => {
          console.log("video error");
          reject();
        });
      }),
      new Promise((resolve, reject) => {
        audioStream.on("finish", () => {
          console.log("audio downloaded");
          resolve();
        });
        audioStream.on("error", () => {
          console.log("audio error");
          reject();
        });
      }),
    ]);

    // Ensure the files exist before merging
    if (!fs.existsSync(videoOutputPath) || !fs.existsSync(audioOutputPath)) {
      throw new Error(
        `One or both input files do not exist: ${videoOutputPath}, ${audioOutputPath}`,
      );
    }

    console.log(`Merging files: ${videoOutputPath}, ${audioOutputPath}`);

    // Merge audio and video using ffmpeg
    await new Promise((resolve, reject) => {
      Ffmpeg()
        .addInput(videoOutputPath)
        .addInput(audioOutputPath)
        .outputOptions([
          "-c:v copy",
          "-c:a copy",
          "-map 0:v:0",
          "-map 1:a:0",
          "-shortest",
        ])
        .output(finalOutputPath)
        .on("end", async () => {
          console.log(
            `Video and audio merged successfully: ${finalOutputPath}`,
          );
          // update downloaded status in db
          await Movies.findOneAndUpdate(
            { videoId },
            {
              $set: {
                downloadStatus: "completed",
                title: fileName,
                url: videoUrl,
                duration: info.videoDetails.durationSeconds,
                channel: channel._id,
              },
            },
            { upsert: true },
          );

          resolve();
        })
        .on("error", async (error) => {
          console.error("Error during merging:", error.message);
          await Movies.findOneAndUpdate(
            {
              videoId,
            },
            {
              $set: {
                downloadStatus: "failed",
                title: fileName,
                url: videoUrl,
                duration: info.videoDetails.durationSeconds,
                channel: channel._id,
              },
            },
            { upsert: true },
          );

          reject(error);
        })
        .run();
    });

    return finalOutputPath;
  } catch (error) {
    console.error(
      "Error downloading or merging video and audio:",
      error.message,
    );
    throw new Error(`Error in downloading video: ${error.message}`);
  } finally {
    if (fs.existsSync(videoOutputPath)) {
      fs.unlinkSync(videoOutputPath);
    }
    if (fs.existsSync(audioOutputPath)) {
      fs.unlinkSync(audioOutputPath);
    }
  }
};

export default downloadVideo;

export const scrapeVideoInfo = async (videoUrl) => {
  const videoInfo = await ytdl.getInfo(videoUrl);
  return videoInfo;
};

export function sanitizeFileName(fileName) {
  if (!fileName) {
    return null;
  }
  const maxLength = 255; // File name length limit for most systems
  const sanitized = fileName?.replace(/[<>:"\/\\|?*]+/g, "").trim();
  return sanitized.length > maxLength
    ? sanitized.substring(0, maxLength)
    : sanitized;
}
