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

// Utility function to create directory if not exists
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Utility function to filter videos based on search terms
const filterVideosBySearchTerms = (videos, searchTerms) => {
  if (!searchTerms || searchTerms.length === 0) {
    return videos; // If no search terms, return all videos
  }

  const terms = searchTerms.split(" ").map(term => term.toLowerCase());
  return videos.filter(video => {
    const videoTitle = video.title.toLowerCase();
    return terms.some(term => videoTitle.includes(term));
  });
};

export async function POST(req) {
  const body = await req.json();
  const { url, searchTerms, destination, option } = body;

  // Validate URL presence
  if (!url) {
    throw new ApiError(400, "Url Required");
  }

  const downloadPath = path.join(destination || os.homedir(), "Yt-Scrape-Output");
  ensureDirectoryExists(downloadPath);

  try {
    if (option === "video" || url.includes("watch")) {
      // Scrape and download single video
      const info = await scrapeVideoInfo(url);
      await downloadVideo(url, downloadPath, info.videoDetails.videoId);

      return NextResponse.json({
        success: true,
        message: "Video downloaded successfully",
      });

    } else if (option === "playlist" || url.includes("playlist")) {
      // Scrape and download playlist
      const playlist = await ytpl(url);
      const playlistPath = path.join(downloadPath, sanitizeFileName(playlist.title));
      ensureDirectoryExists(playlistPath);

      // Map and download videos in playlist
      const videos = playlist.items.map((item) => ({
        url: item.shortUrl,
        filePath: playlistPath,
        videoId: item.id,
      }));

      for (const video of videos) {
        await downloadVideo(video.url, video.filePath, video.videoId);
      }

      return NextResponse.json({
        success: true,
        message: `${videos.length} videos downloaded from playlist`,
      });

    } else if (url.includes("@")) {
      // Scrape videos from YouTube channel
      const userName = url.split("@")[1];
      const scrapedVideos = await scrapeChannelVideos(userName);

      if (!scrapedVideos) {
        throw new ApiError(404, "Channel not found");
      }

      // Filter videos based on search terms
      const filteredVideos = filterVideosBySearchTerms(scrapedVideos, searchTerms);

      if (filteredVideos.length === 0) {
        return NextResponse.json({
          success: false,
          message: "No videos found matching the search terms",
        });
      }

      const channelPath = path.join(downloadPath, sanitizeFileName(userName));
      ensureDirectoryExists(channelPath);

      // Map and download filtered videos from channel
      const videos = filteredVideos.map((item) => ({
        url: `https://www.youtube.com/watch?v=${item.videoId}`,
        filePath: channelPath,
        videoId: item.videoId,
      }));

      for (const video of videos) {
        await downloadVideo(video.url, video.filePath, video.videoId);
      }

      return NextResponse.json({
        success: true,
        message: `${videos.length} videos matching the search terms downloaded from channel`,
      });
    }

    throw new ApiError(400, "Invalid option or URL format");

  } catch (error) {
    console.error("Error in video processing:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing videos",
        error: error.message,
      },
      { status: error.statusCode || 500 }
    );
  }
}
