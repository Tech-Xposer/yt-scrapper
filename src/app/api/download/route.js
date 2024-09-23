import downloadVideo, {
  sanitizeFileName,
  scrapeVideoInfo,
} from "@/services/download";
import scrapeChannelVideos from "@/services/yt-scrape";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";
import os from "os";
import path from "path";
import fs from "fs";
import ytpl from "@distube/ytpl";
import { dir } from "console";
export async function POST(req) {
  const body = await req.json();

  const { url, searchTerms, destination, option } = body;

  // Validate URL presence
  if (!url) {
    throw new ApiError(400, "Url Required");
  }

  try {
    //checking option
    const downloadPath = path.join(
      destination || os.homedir(),
      "Yt-Scrape-Output",
    );
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }
    if (option === "video" || url.includes("watch")) {
      //scraping video infomation
      const info = await scrapeVideoInfo(url);
      await downloadVideo(url, downloadPath, info.videoDetails.videoId);

      return NextResponse.json({
        success: true,
        message: "Video downloaded successfully",
      });
    } else if (option === "playlist" || url.includes("playlist")) {
      //scraping playlist infomation

      const playlist = await ytpl(url);
      const dirPath = path.join(downloadPath, sanitizeFileName(playlist.title));

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const videosToBeDownloaded = playlist.items.map((item) => ({
        url: item.shortUrl,
        filePath: dirPath,
        videoId: item.id,
      }));

      for (const video of videosToBeDownloaded) {
        await downloadVideo(video.url, video.filePath, video.videoId);
      }

      return NextResponse.json({
        success: true,
        message: `${videosToBeDownloaded.length} Playlist downloaded successfully`,
        info: playlist,
      });
    }

    // Extract username from URL (if @ present)
    const userName = url.includes("@") && url.split("@")[1];

    // Scrape videos from the YouTube channel
    const scrapedVideos = await scrapeChannelVideos(userName);

    // If no videos found, throw an error
    if (!scrapedVideos) {
      throw new ApiError(404, "Channel not found");
    }

    // Create the username directory if it doesn't exist
    const dirPath = path.join(
      downloadPath,
      sanitizeFileName(userName || "channel"),
    );
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Prepare the list of videos to be downloaded
    const videosToBeDownloaded = scrapedVideos.map((item) => {
      return {
        url: `https://www.youtube.com/watch?v=${item.videoId}`,
        filePath: dirPath,
        videoId: item.videoId,
      };
    });

    // Check for the download directory

    for (const video of videosToBeDownloaded) {
      await downloadVideo(
        video.url,
        video.filePath,
        sanitizeFileName(video.fileName),
        video.videoId,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Videos downloaded  successfully",
      info: {
        length: videosToBeDownloaded.length,
        videos: videosToBeDownloaded,
      },
    });
  } catch (error) {
    console.error("Error in video processing:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing videos",
        error: error.message,
      },
      { status: error.statusCode || 500 },
    );
  }
}
