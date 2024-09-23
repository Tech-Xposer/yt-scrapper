import dbConnect from "@/lib/connect";
import Channel from "@/models/channel.model";
import Movies from "@/models/movies.model";
import { extractIdFromUrl } from "@/services/yt-info";
import scrapeChannelVideos from "@/services/yt-scrape";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, searchTerms, destination } = body;

    if (!url) {
      throw new ApiError(400, "Url Required!");
    }

    // Connect to the database
    await dbConnect();

    let userName = url.includes("@") && url.split("@")[1];

    let channel = await Channel.findOne({ channelUrl: url });

    // If channel does not exist, fetch the channel ID and create a new entry
    if (!channel) {
      const channelId = await extractIdFromUrl(`@${userName}`);

      // Create new channel in the database
      channel = await Channel.create({
        channelUrl: url,
        channelId: channelId,
      });
    }

    // Scrape the channel's videos based on the username or handle
    const scrapedData = await scrapeChannelVideos(userName);
    const videoIds = scrapedData.map((video) => video.videoId);

    // Find existing videos in the database
    const existingVideos = await Movies.find({ videoId: { $in: videoIds } })
      .select("videoId")
      .lean();
    const existingVideoIds = new Set(
      existingVideos.map((video) => video.videoId),
    );

    // Filter out existing videos from scrapedVideos
    const newVideos = scrapedData
      .filter((video) => !existingVideoIds.has(video.videoId))
      .map((video) => ({
        title: video.title,
        videoId: video.videoId,
        duration: video.lengthSeconds,
        channel: channel._id,
        query: searchTerms,
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
      }));

    // Save the scraped videos to the database
    const insertedData = await Movies.insertMany(newVideos);

    // Return a successful response with the scraped videos data
    return NextResponse.json(
      {
        message: "Videos downloaded successfully",
        data: { length: scrapedData.length,
          channelName: userName,
         },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in POST /api/channel-info:", error.message);

    // Return an error response
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred.",
      },
      { status: error.statusCode || 500 },
    );
  }
}
