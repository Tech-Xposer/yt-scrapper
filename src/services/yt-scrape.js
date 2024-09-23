import ytch from "yt-channel-info";

const scrapeChannelVideos = async (channelId) => {
  console.log("Fetching videos for channelId:", channelId);

  const payload = {
    channelId,
    maxResults: 100,
    sortBy: "newest",
  };

  const videos = [];
  try {
    let response = await ytch.getChannelVideos(payload);

    // Combine initial and subsequent results if needed
    while (response) {
      console.log(`Fetched ${response.items.length} videos`);
      videos.push(...response.items);

      if (!response.continuation) break;

      // Fetch additional videos using continuation token
      response = await ytch.getChannelVideosMore({
        continuation: response.continuation,
      });
    }

    return videos;
  } catch (error) {
    console.error("Error fetching channel videos:", error.message);
    return videos;
  }
};

export default scrapeChannelVideos;
